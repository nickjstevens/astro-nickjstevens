---
title: "Solve ANSYS Workbench project without opening"
description: "If you have a remote Linux server that can be used for solving, but there is a big lag with the graphics, then this tip to solve a Workbench project without..."
pubDate: 2019-06-27
updatedDate: 2022-05-13
tags: ["Engineering", "ANSYS"]
heroImage: "../../assets/blog-placeholder-3.jpg"
---

If you have a remote Linux server that can be used for solving, but there is a big lag with the graphics, then this tip to solve a Workbench project without opening it may be useful.

First, create a Workbench **journal file **that defines where the project is and opens it, solves it and saves it. Note that `#` in a journal file is for a comment line. I’ve called this file **“UpdateProjectLinux.wbjn”**.

```python
workingDir = AbsUserPathName(“/scratch/Clip_FEA/”)
# Open the Workbench Project
Open(FilePath = workingDir + “Clip_v8.wbpj”)
# encoding: utf-8
SetScriptVersion(Version=”15.0″)
# Run the project 
updateUpdate()
# Save
Save(Overwrite=True)
```

Now create a Linux bash script to open the journal file created above, which will launch ANSYS and update your project, all in the background. The bash file contains the path to your ANSYS installation. I’ve called this file **“RunandUpdate.sh”**. It can be launched from a command window by the command `bash RunandUpdate.sh`

```bash
#!/bin/sh
echo Run Start: $(date +’%c’)
echo Analysing…
/usr3/ansys/v150/Framework/bin/Linux64/runwb2 -B -R UpdateProjectLinux.wbjn
echo Analysis complete.
echo Run End: $(date +’%c’)
```

I’ve found this really useful if for whatever reason there is a big graphics lag when trying to open a Workbench project remotely. I can make my modifications in ANSYS locally, then upload my project to the Linux server and solve remotely and quickly.

I’ve barely started learning about journal files, but there is a useful section in the ANSYS help in using a journal file to export results to Excel for Design Points… Something to try out in the future I think.
