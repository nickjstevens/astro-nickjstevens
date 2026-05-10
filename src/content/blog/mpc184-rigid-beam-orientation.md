---
title: "MPC184 rigid beam orientation"
description: "In APDL, you can display the element coordinate system from the Symbols dialog box. However, there is a bug where for MPC184 rigid beam elements the displaye..."
pubDate: 2019-06-20
updatedDate: 2022-05-13
tags: ["Engineering", "ANSYS"]
---

In APDL, you can display the element coordinate system from the Symbols dialog box. However, there is a bug where for MPC184 rigid beam elements the displayed element coordinate system is not correct. This means it is not obvious which axis is which in terms of shear and bending moment output. I had previously raised this as a ticket with ANSYS help, and after investigating they confirmed that the default orientation (noting that MPC184 rigid beams do not use an orientation node) is the same as that of a BEAM188 without an orientation node.

In confusing terms this is: X is from I to J and Y is obtained with the cross product of local X with global Z (i.e. it is parallel to the global x-y plane). In case of X being parallel to global Z, local Z is obtained with the cross product of local X with global Y (i.e. local Y is parallel to global Y).

I’ve found the simplest way is to interactively define a BEAM188 so you can see the orientation clearly.

Another point to note with MPC184 rigid beams is that the values output via SMISC are average values and this can make for misleading results. For example, if one of the end rigid beam is “pinned” (e.g. with CPs) then clearly this end would have a zero moment whereas the other end may have finite moment value. The average here would in fact be half of the finite moment at the non-pinned end. Just something to think about if you have rigid beams in this way.
