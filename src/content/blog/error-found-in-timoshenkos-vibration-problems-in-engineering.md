---
title: "Error Found in Timoshenko’s Vibration Problems in Engineering"
description: "Timoshenko’s “Vibration Problems in Engineering” (4th Edition, 1974) gives an example (2.5 9) for the displacement and frequency of a simple system involving..."
pubDate: 2019-06-21
updatedDate: 2022-05-13
tags: ["Engineering"]
heroImage: "/blog-assets/notion-migration/error-found-in-timoshenkos-vibration-problems-in-engineering/Untitled%20227.png"
---

Timoshenko’s “Vibration Problems in Engineering” (4th Edition, 1974) gives an example (2.5-9) for the displacement and frequency of a simple system involving a mass and two springs under preload. The example is shown in the figure below.

![Untitled 227](/blog-assets/notion-migration/error-found-in-timoshenkos-vibration-problems-in-engineering/Untitled%20227.png)

*Problem 2.5-9 from Timoshenko’s Vibration Problems in Engineering*

Timoshenko gives the following formulas for period and displacement amplitude, a mass with the initial conditions $x_0 = 0$ and $\dot x_0 \ne 0$ as:

$\tau = \frac{2}{p}\tan^{-1}\big(\frac{k\dot x_0}{p_1p}\big)$

$x_m = \sqrt{\big(\frac{\dot x_0}{p}\big)^2 + \big(\frac{p_1}{k}\big)^2} - \frac{p_1}{k}$

Where:

$\tau$ is the period in seconds

$p$ is the radian frequency in rad/s, $p=\sqrt{\frac{k}{m}}$

$k$ is the spring stiffness in N/m

$\dot x_0$ is the initial velocity in m/s

$P_1$ is the spring preload in N

$x_m$ is the peak amplitude in metres

$m$ is the mass in kg

Note that there is an error in the text book for the formula for period, where the factor of 2 should in fact be 4. This becomes apparent in the limit for $P_1 = 0$ (i.e. no preload) where the period should be:

$\tau = \frac {2\pi}{p}$

But given that $\tan^{-1}(\infty) = \frac{\pi}{2}$ the original Timoshenko formula would yield:

$\tau = \frac{2}{p} \tan^{-1}(\infty) = \frac{2}{p} \frac{\pi}{2} = \frac{\pi}{p}$

This is incorrect, and out by a factor of 2.

The corrected formula for period is therefore (see full derivation below):

$\tau = \frac{4}{p}\tan^{-1}\big(\frac{k\dot x_0}{p_1p}\big)$

## Derivation of Corrected Formula for Timoshenko Problem 2.5-9

The equation of motion for the example problem 2.5-9 is:

$m\ddot x = -(P_1 + kx)$

Which can be written:

$m\ddot x + kx = -P_1$

The right hand term in the above equation is a constant and Timoshenko suggests that this be considered as a pseudostep function applied to a system with mass $m$ and spring stiffness $k$.

By this approach the total response may be calculated as the sum of the effects of the initial conditions and the influence of the pseudostep function.

The displacement due to free vibration, where the initial displacement $x_0=0$, is given by:

$x = \frac{\dot x_0}{p} \sin{pt}$

Where:

$\frac{\dot x_0}{p}$ is the peak displacement amplitude

The displacement due to a step force that jumps from zero and is then held at a constant value $P_1$ is given by:

$x = \frac{P_1}{k} (1 - \cos{pt})$

According to Timoshenko, the total response is the combination of the two components, noting that for this case the step force is negative relative to the direction of motion:

$x = \frac{\dot x_0}{p} \sin{pt} - \frac{P_1}{k} (1 - \cos{pt})$

Which can be rewritten:

$x = \frac{\dot x_0}{p} \sin{pt} - \frac{P_1}{k} + \frac{P_1}{k}\cos{pt}$

Differentiate to obtain the velocity:

$x = \frac{\dot x_0}{p} \sin{pt} - \frac{P_1}{k} + \frac{P_1}{k}\cos{pt}$

The time of maximum response occurs when $\dot x=0$:

$0 = \dot x_0 \cos{pt} - \frac{P_1 p}{k} \sin{pt}$

$\frac{P_1 p}{k} \sin{pt} = \dot x_0 \cos{pt}$

$\frac{\sin{pt}}{\cos{pt}} = \frac{k \dot x_0}{P_1 p}$

$\tan{pt} = \frac{k \dot x_0}{P_1 p}$

$pt = \tan^{-1} \big(\frac{k \dot x_0}{P_1 p}\big)$

$t = \frac{1}{p}\tan^{-1} \big(\frac{k \dot x_0}{P_1 p}\big)=t_m$

The above equation is the time to go from zero to maximum displacement. In terms of the full harmonic motion, this therefore represents ¼ of the period. Therefore the period is:

$\tau = 4t_m = \frac{4}{p}\tan^{-1} \big(\frac{k \dot x_0}{P_1 p}\big)$

This is therefore the corrected equation for the period for problem 2.5-9.

## Closing Remarks

This error demonstrates the need to question everything, and highlights the importance of verification. This error was first spotted when the results from a finite element analysis of this problem done as part of a verification activity yielded different answers.
