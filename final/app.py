import sys
import os
import glob
import re
import numpy as np
import tensorflow as tf
import json
import PIL.Image as Image
# Keras
from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image

# Flask utils
from flask import Flask, redirect, url_for, request, render_template, jsonify, Markup
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIServer

import boto
import sys
def percent_cb(complete, total):
    sys.stdout.write('.')
    sys.stdout.flush()

# Define a flask app
app = Flask(__name__)

# Load your trained model
MODEL_PATH = './models/model.h5'

model = load_model(MODEL_PATH)

malware_class = {1: "Ramnit", 2: "Lollipop", 3: "Kelihos_ver3", 4: "Vundo", 5: "Simda", 6: "Tracur", 7: "Kelihos_ver1", 8: "Obfuscator.ACY", 9: "Gatak"}

print('Model loading...')

print('Model loaded. Started serving...')

print('Model loaded. Check http://127.0.0.1:5000/')

def model_predict(img_path, model):
    original = image.load_img(img_path, target_size=(224, 224))

    # Preprocessing the image
    
    # Convert the PIL image to a numpy array
    # IN PIL - image is in (width, height, channel)
    # In Numpy - image is in (height, width, channel)
    numpy_image = image.img_to_array(original)

    # Convert the image / images into batch format
    # expand_dims will add an extra dimension to the data at a particular axis
    # We want the input matrix to the network to be of the form (batchsize, height, width, channels)
    # Thus we add the extra dimension to the axis 0.
    image_batch = np.expand_dims(numpy_image, axis=0)

    print('PIL image size = ', original.size)
    print('NumPy image size = ', numpy_image.shape)
    print('Batch image  size = ', image_batch.shape)

    # Be careful how your trained model deals with the input
    # otherwise, it won't make correct prediction!
    processed_image = preprocess_input(image_batch, mode='caffe')
    
    #with graph.as_default():    
        
    preds = model.predict(processed_image)
    
    print('Deleting File at Path: ' + img_path)

    os.remove(img_path)

    print('Deleting File at Path - Success - ')

    return preds


@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('template.html')

@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['image']
        # Save the file to ./uploads
        basepath = os.path.dirname(__file__)
        filename = f.filename
        file_path = os.path.join(
            basepath, 'uploads', secure_filename(f.filename))
        f.save(file_path)
        w = 1024
        h = os.stat(file_path).st_size//w
        with open(file_path, 'rb') as img_file:
            byte = np.fromfile(img_file, dtype=np.int8, count=w*h).reshape(w, h)
        f = Image.fromarray(byte).convert('RGB')
        file_path = os.path.splitext(file_path)[0]+'.jpg'
        f.save(file_path)
        REGION = 'REGION'
        BUCKET = 'BUCKET'
        s3_connection = boto.connect_s3('ACCESSKEY', 'ACCESSVALUE', host='s3.us-east-2.amazonaws.com')
        bucket = s3_connection.get_bucket(BUCKET)
        key = boto.s3.key.Key(bucket, file_path)
        key.set_contents_from_filename(file_path,
                cb=percent_cb, num_cb=10, policy='public-read')
    

        print('Begin Model Prediction...')

        # Make prediction
        preds = model_predict(file_path, model)
        # 2x1 
        print(preds)

        k = 5

        scores = list(zip(preds[0],[i for i in range(1,10)]))
        scores = sorted(scores, key = lambda x: x[0], reverse = True)
        pred_class = [scores[i][1] for i in range(k)]
        scores = [str(int(scores[i][0]*10000)) for i in range(k)]



        print('End Model Prediction...')

        # Process your result for human
        # pred_class = preds.argmax(axis=-1)            
        # result = malware_class[pred_class[0]+1]

        pred_class = [malware_class[val] for val in pred_class]
        # variable = dict(zip(['Top%s'%i for i in range(1,k+1)] + [ 'acc%s'%i for i in range(1, k+1)], pred_class+scores))
        upload_url = f"https://{BUCKET}.{REGION}.amazonaws.com/"+f"uploads/{filename.split('.')[0]+'.jpg'}"
        return upload_url + " " +' '.join(pred_class) + ' '+ ' '.join(scores)
    return None

if __name__ == '__main__':    
    app.run(host='0.0.0.0', debug=False, threaded=False)
