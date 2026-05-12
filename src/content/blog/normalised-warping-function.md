---
title: "Normalised Warping Function"
description: "SCI P057 (Ref 1) provides an excellent reference for warping and torsion of beams . It contains useful formulas for standard I and channel sections. However,..."
pubDate: 2019-06-23
updatedDate: 2022-05-13
tags: ["Engineering", "ANSYS", "Simulation"]
heroImage: "/blog-assets/notion-migration/normalised-warping-function/Untitled%20228.png"
---

## Warping and Torsion

SCI P057 (Ref 1) provides an excellent reference for **warping and torsion of beams**. It contains useful formulas for standard I and channel sections. However, for non-standard sections, for example those built-up from a number of sections (like crane rail girders), it is difficult to obtain an analytical solution to the normalised warping function $W_{ns}$ and warping statical moment $S_{ws}$. These functions are required to calculate the warping normal stress and the warping shear stress respectively. The functions are based on the geometry of the section, but vary at any point on the section.

![Untitled 228](/blog-assets/notion-migration/normalised-warping-function/Untitled%20228.png)

Warping Stresses

## Normalised Warping Function for Non-Standard Sections

For non-standard sections, the complication integral formulas in Appendix A of SCI P057 are very hard to apply. This article suggests an alternative method using a simple finite element model under simple loading conditions to calculate the normalised warping function $W_{ns}$ and warping statical moment $S_{ws}$.

The magnitude of the warping normal stress at any particular point ‘s’ in the cross section is given by:

$\sigma_w = -EW_{ns}\phi''$

Where

$W_{ns}$ is the normalised warping function at the particular point ‘s’ in the cross section.

From this relationship we can construct a simple FE model where the warping normal stress, elastic modulus and second derivative of the angle of twist can be determined, leaving the unknown normalised warping function $W_{ns}$ to be calculated. The normalised warping function $W_{ns}$ is a function of the section, so after determining this from an FE model under simple loading it can now be used for more complicated loading.

## Methodology

The section is created in ANSYS of an arbitrary length and meshed with a solid mesh. A torque (torsional moment) is applied to one end, with the other end fixed. The torque should be applied about the shear centre. This loading sets up a pure torsional warping stress state, i.e. the results are not muddied by axial loads or bending moments.

Displacements are output and processed in Excel to calculate the angle of twist. A typical plot of the angle vs. the distance along the member is shown in the figure below.

![Untitled 229](/blog-assets/notion-migration/normalised-warping-function/Untitled%20229.png)

*Angle of Twist vs. Distance Along the Member*

Once the angle of twist with distance along the member is calculated this data can be curve fitted with a 3rd order polynomial. Excel can helpfully provide the polynomial coefficients which then means we can differentiate the angle function twice to get $\phi''$. As this is just an equation, we can helpfully plot this as a User Defined Function in ANSYS, as shown below.

![Untitled 230](/blog-assets/notion-migration/normalised-warping-function/Untitled%20230.png)

*Second Derivative of Angle of Twist*

From this, the normalised warping function $W_{ns}$ can be calculated as:

$W_{ns}=\sigma_w/(E*\phi'')$

$\sigma_w$ is just the SZ stress in this case as there are no other stresses in the axial direction except this normal warping stress. We can also plot the normalised warping function as a User Defined Function in ANSYS, as shown below.

![Untitled 231](/blog-assets/notion-migration/normalised-warping-function/Untitled%20231.png)

*Normalised Warping Function*

Similarly we can take the third derivative of the angle of twist, and from this the warping statical moment $S_{ws}$ can be calculated. These are properties of the geometry of the section, but varying with position on the section. Now they have been derived from a simple load case, the normalised warping function $W_{ns}$ and warping statical moment $S_{ws}$ can be used for combined torsion and bending load cases using SCI P057.

## References

1. SCI P057, Design of Members Subject to Combined Bending and Torsion, The Steel Construction Institute
