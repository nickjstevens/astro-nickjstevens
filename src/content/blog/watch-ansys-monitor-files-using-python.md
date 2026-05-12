---
title: "Watch ANSYS Monitor Files Using Python"
description: "A small Python script for watching the most recent ANSYS monitor file and printing progress as it updates."
pubDate: 2026-05-10
updatedDate: 2022-05-13
tags: ["Engineering", "ANSYS", "Software"]
heroImage: "../../assets/blog-placeholder-4.jpg"
---

If you regularly spend your day opening ANSYS monitor (`.mntr`) files then this post is for you. I’ve written a little script to watch monitor files using Python. The script watches a folder and will print out the last line of the file whenever a new line is written to the monitor file. The other clever thing is that it’ll always use the most recent monitor file, so if you have a series of runs then you only need to run the script once and it’ll always give you the status of the most recent monitor file.

By the way, if the company you work for has a restrictive IT department (and you can’t install Python), then have a root around on your local C drive (search for `python.exe`) and you may well find you have a version of Python installed that you can tap in to and utilise.

## Script to watch monitor files using Python

```python
import glob
import os
import time


def latest_monitor_file():
    """Return the most recently modified ANSYS monitor file in this folder."""
    files = glob.glob("*.mntr")
    if not files:
        return None
    return max(files, key=os.path.getmtime)


def watch():
    """Yield new lines from the latest ANSYS .mntr file."""
    current_file = None
    fp = None

    while True:
        latest_file = latest_monitor_file()

        if latest_file is None:
            time.sleep(5)
            continue

        if latest_file != current_file:
            if fp:
                fp.close()
            current_file = latest_file
            fp = open(current_file, "r")
            fp.seek(0, os.SEEK_END)

        new_line = fp.readline()
        if new_line:
            yield new_line
        else:
            time.sleep(0.5)


for line in watch():
    print(line[43:52])
```

Hope you find it useful! Writing little scripts like this is useful, and also helps me develop my Python skills.
