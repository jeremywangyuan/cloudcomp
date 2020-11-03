#!/usr/bin/env python
"""mapper.py"""

import sys

for line in sys.stdin:
    line = line.strip()
    words = line.split()
    for word in words:
    	if word == '-':
    		break
    	print ('%s\t%s' %(word, 1))
	    	        