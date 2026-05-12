---
title: "ANSYS Percentage Stress Error"
description: "ANSYS Workbench allows you to plot the absolute stress error energy (SERR), which is a measure of the discretisation error within the model. Error occurs for..."
pubDate: 2019-06-24
updatedDate: 2022-05-13
tags: ["Engineering", "ANSYS"]
heroImage: "/blog-assets/notion-migration/ansys-percentage-stress-error/Untitled 246.png"
---

ANSYS Workbench allows you to plot the absolute stress error energy (SERR), which is a measure of the discretisation error within the model. Error occurs for displacement-based problems because displacement compatibility is enforced resulting in a **continuous** displacement field from element to element, but a **discontinuous **stress field. To obtain more acceptable stresses, averaging of the element nodal stresses is done. The error due to this averaging can be quantified, which is how the stress error energy is calculated.

## The problem with stress error energy

Stress error energy can be plotted in ANSYS directly, and can be accessed as a User Defined Result as SERR. However, it is a measure of the absolute stress error, so a high stress error may be acceptable if it is also in a region where the strain energy is high in the model anyway. What we really want to know is the **percentage** stress error.

## Plotting the percentage stress error in ANSYS

The ANSYS percentage stress error can be considered as the stress error energy divided by the total strain energy. The strain energy can be accessed as a User Defined Result as ENERGYPOTENTIAL. So to plot the percentage stress error create a User Defined Result with the following formula:

```plain text
(SERR/ENERGYPOTENTIAL)*100
```

The *100 gets the result expressed as a percentage (%). The User Defined Result is also shown in the screenshot below:

![ANSYS Percentage Stress Error Formula](/blog-assets/notion-migration/ansys-percentage-stress-error/Untitled%20246.png)

You can now plot this User Defined Result which will give you a plot of the percentage stress error in ANSYS. This will help highlight areas where further mesh refinement is required. Typically you might want to aim for a percentage stress error below 5% or 10% in your region of interest. The screenshot below shows a plot of the percentage stress error. The mesh is coarse on purpose to demonstrate the method, and as expected, with high stress errors further mesh refinement is needed.

![ANSYS Percentage Stress Error Plot](/blog-assets/notion-migration/ansys-percentage-stress-error/Untitled%20247.png)

So in closing, having confidence in the level of mesh refinement in your model is important, and plotting percentage stress error is one way to do it. It complements other methods to review the model such as mesh quality checks, plotting stresses as “nodal fraction” or “elemental fraction”, and checking convergence with increased mesh density.
