---
title: "Mesh Convergence Web App"
description: "Mesh convergence is one of the cornerstones of engineering verification, and to provide users with the best tools I’m happy to launch my Mesh Convergence Web..."
pubDate: 2019-06-19
updatedDate: 2022-05-13
tags: ["Engineering", "Simulation"]
heroImage: "/blog-assets/notion-migration/mesh-convergence-web-app/Untitled%20248.png"
---

Mesh convergence is one of the cornerstones of engineering verification, and to provide users with the best tools I’m happy to launch my [Mesh Convergence Web App](https://www.nickjstevens.com/fea/richardson-extrapolation/). It’s free, easy and addresses a hugely important aspect of simulation governance. 

I've previously written about the importance of mesh convergence ([Richardson Extrapolation and Grid Convergence Index](https://www.nickjstevens.com/blog/richardson-extrapolation-and-grid-convergence-index/)), and the first iteration provided an Excel spreadsheet to implement the Grid Convergence Index. The [web app](https://www.nickjstevens.com/fea/richardson-extrapolation/) is one step closer to the user, running the code in the browser on almost any device. Simply enter the results (stresses, displacements, anything) from three different meshes, in order of coarsest to finest, and Calculate the predicted exact answer. There are some checks in place to warn the user if the results are problematic.

Here is a screenshot of the web app in action, providing an estimated exact answer, along with 95% Confidence Interval values.

![Mesh Convergence Web App](/blog-assets/notion-migration/mesh-convergence-web-app/Untitled%20248.png)

I hope you find this useful and easy-to-use.

## Behind the Scenes

For those interested, the web app is built using [Anvil](https://anvil.works/), which means the entire software stack can be controlled with python, as well as providing an interactive editor. It really has been a pleasurable experience, and I’d recommend anyone taking first steps into the world of software to take a look. As I start out I am using the free tier (hence the human unfriendly URL for the web app!) but as I test out the waters with other ideas I’ll be looking to upgrade and make a more permanent home for the mesh convergence web app.

### Feedback

I think the web app should be useful to practising engineers, and I’d love to hear any feedback, comments or suggestions. Perhaps you have a useful feature that I could add, or perhaps an idea for a different web app in the engineering domain. Either way, I’d love to hear from you.
