#!/usr/bin/env python

import os, re, glob

re_text = re.compile("<h2>(?P<text>.*)</h2>", re.I)
re_img  = re.compile(r'<img.*?src="(?P<img_url>.*?)"', re.I)

print "var reactions = ["
for filename in glob.glob('*.html'):
    f = open(filename)
    lines = f.readlines()
    f.close()

    text=""
    tags=""
    url="https://splunkreactions.tumblr.com/post/%s"%filename
    image_url=""

    for l in lines:
        tm = re_text.search(l)
        im = re_img.search(l)

        if tm:
            text = tm.group("text")
            text = text.replace('"',r'\"')  # naive
        elif im:
            image_url = im.group("img_url")


    print """   {
        "text": "%s",
        "url": "%s",
        "image_url": "%s",
        "tags": ""
    },
"""%(text, url, image_url)

print "]\n\nmodule.exports.reactions = reactions;"
