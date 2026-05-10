---
title: "Practical Tips for Dealing with Stress Singularities"
description: "Stress Singularities Introduction"
pubDate: 2019-06-22
updatedDate: 2022-05-13
tags: ["Engineering", "Simulation"]
---

![Untitled 222](/blog-assets/notion-migration/practical-tips-for-dealing-with-stress-singularities/Untitled%20222.png)

## Stress Singularities Introduction

Stress singularities are artificial artefacts of a finite element model; where you have a point load, sharp corner or other feature that is idealised for an analysis, but which in doing so produces a numerical singularity (i.e. the stress will tend to infinity as the mesh size tends to zero). Rather than go into the details, this article instead aims to give some practical tips to discover and deal with stress singularities.

## Practical Tips for Dealing with Stress Singularities

Despite the prevalence of stress singularities in finite element analysis, due to geometry idealisation, application of point force, or other sources of “artificial” singularities, there is little practical guidance on how to deal with the issue. This article aims to give an overview of the possible options, which can then be developed depending on your particular application.

Generally, you become aware of a stress singularity when you perform a mesh refinement study (which **everyone** should do by default). Divergence in the results with mesh refinement may be obvious, or you may be using a tool like [Richardson Extrapolation and Grid Convergence Index](https://www.nickjstevens.com/blog/richardson-extrapolation-and-grid-convergence-index/). Either way, you refine the mesh to check convergence, and either:

1. the stress (or other result of interest) **convergences**, in which case you can use [Richardson Extrapolation and Grid Convergence Index](https://www.nickjstevens.com/blog/richardson-extrapolation-and-grid-convergence-index/) to estimate your exact answer.
2. the stress **diverges**, and no amount of mesh refinement will make a jot of difference because you have a **stress singularity**. If this is the case then you still need to get to the point where you can demonstrate convergence and so the options (as I see them) are:
    - (A) remove the singularity from the model. For example replace a sharp corner with a radius, etc. A sub model would be a good way to do this since you don’t necessarily need or want to refine the entire model. In which case you should be able to go back to 1. and demonstrate convergence with mesh refinement.
    - (B) recognise you have a stress singularity and work around it, mainly involving various ways of “ignoring” the peak stress, which is fair as long as fatigue or fracture mechanics isn’t of interest (i.e. peak stress is not really that important from a structural collapse point of view):
        - (B1) ignore the very peak stress at the singularity, and instead demonstrate convergence somewhat away from the singularity (for example monitor the stress at a distance “t” away from a sharp corner, where “t” is the thickness of the plate). This is St. Venant’s principle, where sufficiently far away from point loads, boundaries, sharp corners etc, the solution is appropriate.
        - (B2) use stress linearisation to extract membrane + bending stress (i.e. removes the peak stress) and again check that membrane + bending converges with mesh refinement.
    - (C) use elastic-perfectly-plastic material properties so the unrealistic high stress is capped at yield and demonstrate that the plastic strains are low (say <5% – reference BS EN 1993-1-5:2006, C.8) such that the load can easily be redistributed despite the artificial singularity, and the structure can safely withstand the load without collapse.

## Stress Singularity Example

The following example shows a sharp corner, and demonstrates a stress diverging with mesh refinement. The solution would be one of the options above. (Part of the reason for me doing this is to test out the [Simscale platform](https://www.simscale.com/) for analysis in the cloud).

The model is a simple sharp corner, fixed on the right-hand side and with a load applied to the left-hand side.

![Untitled 223](/blog-assets/notion-migration/practical-tips-for-dealing-with-stress-singularities/Untitled%20223.png)

*Stress Singularity Example*

Say we are interested in the peak stress, which occurs at this sharp corner. The result is a von Mises stress of 41.63MPa for 33178 elements:

![Untitled 224](/blog-assets/notion-migration/practical-tips-for-dealing-with-stress-singularities/Untitled%20224.png)

*Coarse Mesh*

The mesh is refined to give 48.58MPa using 53986 elements:

![Untitled 225](/blog-assets/notion-migration/practical-tips-for-dealing-with-stress-singularities/Untitled%20225.png)

*Fine Mesh*

The mesh is refined further to give 65.63MPa using 388259 elements:

![Untitled 226](/blog-assets/notion-migration/practical-tips-for-dealing-with-stress-singularities/Untitled%20226.png)

*Very Fine Mesh*

Clearly the stress is diverging and therefore one of the options above should be used. Hopefully this highlights the danger of using results without having done a mesh refinement study, even if the mesh “looks good enough”. If there is one take-away, please always do a mesh convergence study if you are using peak stress results.

The Simscale model can be accessed here: [https://www.simscale.com/projects/nickjstevens/stresssingularity/](https://www.simscale.com/projects/nickjstevens/stresssingularity/).

Courtesy of Jeremy Theler, there is also an equivalent model in **CAEplex** (an open source cloud finite element analysis platform) here: [https://caeplex.com/r?b09](https://caeplex.com/r?b09=).
