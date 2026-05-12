---
title: "Custom Excel VBA Function for SCI Bolted Joint Assessment"
description: "Use a custom Excel VBA function to return alpha values for bolted joint assessments using SCI P207."
pubDate: 2026-05-10
updatedDate: 2022-05-13
tags: ["Engineering", "Software"]
heroImage: "/blog-assets/notion-migration/custom-excel-vba-function-for-sci-bolted-joint-assessment/Untitled%20209.png"
---

The principle of [DRY (Don’t Repeat Yourself)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) is well-known in software engineering circles as a way of reusing code to make software easier to maintain, debug and check. We can use the same approach in engineering calculations by packaging a function so that it can be checked once, and reused many times.

The use case here is using a custom Excel VBA function to return the alpha values in a bolted joint assessment using SCI P207 (*Joints in steel construction: Moment connections*). Typically, without the help of an Excel function, this involved looking up the alpha value on a lookup graph for use in a calculation. This is fine for one case, but for iterative design development or to use in multiple bespoke connections this is laborious and error-prone.

An example spreadsheet, complete with the custom function is attached below:

[SCI-Bolted-Joint-Alpha.xlsm](/blog-assets/notion-migration/custom-excel-vba-function-for-sci-bolted-joint-assessment/SCI-Bolted-Joint-Alpha.xlsm)

The function is as simple to use as calling `=alpha(m1,m2,e)` where `m1`, `m2` and `e` are the distances as defined in SCI P207.

![Example Excel alpha function for SCI bolted joint assessment](/blog-assets/notion-migration/custom-excel-vba-function-for-sci-bolted-joint-assessment/Untitled%20209.png)

The VBA code is below:

```vb
Option Explicit

Function alpha(m1, m2, e)
    Dim lambda1, lambda2, F1, F2, F3, F4, F5, F6 As Double
    Dim i, j As Integer
    
    lambda1 = m1 / (m1 + e)
    lambda2 = m2 / (m1 + e)
    
    Dim lambda_array(2 To 12) As Double
    Dim F_array(1 To 12, 1 To 6) As Double
    
    lambda_array(2) = lambda1
    lambda_array(3) = lambda2
    lambda_array(4) = lambda1 ^ 2
    lambda_array(5) = lambda2 ^ 2
    lambda_array(6) = lambda1 * lambda2
    lambda_array(7) = lambda1 ^ 3
    lambda_array(8) = lambda2 ^ 3
    lambda_array(9) = lambda1 * (lambda2 ^ 2)
    lambda_array(10) = (lambda1 ^ 2) * lambda2
    lambda_array(11) = lambda1 ^ 4
    lambda_array(12) = lambda2 ^ 4

    'read in constants
    For i = 4 To 15
        For j = 8 To 13
            F_array(i - 3, j - 7) = Sheets("Alpha Constants").Cells(i, j).Value
        Next j
    Next i

    F1 = F_array(1, 1) + lambda_array(2) * F_array(2, 1) + lambda_array(3) * F_array(3, 1) + lambda_array(4) * F_array(4, 1) + lambda_array(5) * F_array(5, 1) + lambda_array(6) * F_array(6, 1) + lambda_array(7) * F_array(7, 1) + lambda_array(8) * F_array(8, 1) + lambda_array(9) * F_array(9, 1) + lambda_array(10) * F_array(10, 1) + lambda_array(11) * F_array(11, 1) + lambda_array(12) * F_array(12, 1)
    F2 = F_array(1, 2) + lambda_array(2) * F_array(2, 2) + lambda_array(3) * F_array(3, 2) + lambda_array(4) * F_array(4, 2) + lambda_array(5) * F_array(5, 2) + lambda_array(6) * F_array(6, 2) + lambda_array(7) * F_array(7, 2) + lambda_array(8) * F_array(8, 2) + lambda_array(9) * F_array(9, 2) + lambda_array(10) * F_array(10, 2) + lambda_array(11) * F_array(11, 2) + lambda_array(12) * F_array(12, 2)
    F3 = F_array(1, 3) + lambda_array(2) * F_array(2, 3) + lambda_array(3) * F_array(3, 3) + lambda_array(4) * F_array(4, 3) + lambda_array(5) * F_array(5, 3) + lambda_array(6) * F_array(6, 3) + lambda_array(7) * F_array(7, 3) + lambda_array(8) * F_array(8, 3) + lambda_array(9) * F_array(9, 3) + lambda_array(10) * F_array(10, 3) + lambda_array(11) * F_array(11, 3) + lambda_array(12) * F_array(12, 3)
    F4 = F_array(1, 4) + lambda_array(2) * F_array(2, 4) + lambda_array(3) * F_array(3, 4) + lambda_array(4) * F_array(4, 4) + lambda_array(5) * F_array(5, 4) + lambda_array(6) * F_array(6, 4) + lambda_array(7) * F_array(7, 4) + lambda_array(8) * F_array(8, 4) + lambda_array(9) * F_array(9, 4) + lambda_array(10) * F_array(10, 4) + lambda_array(11) * F_array(11, 4) + lambda_array(12) * F_array(12, 4)
    F5 = F_array(1, 5) + lambda_array(2) * F_array(2, 5) + lambda_array(3) * F_array(3, 5) + lambda_array(4) * F_array(4, 5) + lambda_array(5) * F_array(5, 5) + lambda_array(6) * F_array(6, 5) + lambda_array(7) * F_array(7, 5) + lambda_array(8) * F_array(8, 5) + lambda_array(9) * F_array(9, 5) + lambda_array(10) * F_array(10, 5) + lambda_array(11) * F_array(11, 5) + lambda_array(12) * F_array(12, 5)
    F6 = F_array(1, 6) + lambda_array(2) * F_array(2, 6) + lambda_array(3) * F_array(3, 6) + lambda_array(4) * F_array(4, 6) + lambda_array(5) * F_array(5, 6) + lambda_array(6) * F_array(6, 6) + lambda_array(7) * F_array(7, 6) + lambda_array(8) * F_array(8, 6) + lambda_array(9) * F_array(9, 6) + lambda_array(10) * F_array(10, 6) + lambda_array(11) * F_array(11, 6) + lambda_array(12) * F_array(12, 6)
    
    If lambda1 <= F1 Then
        alpha = 2 * WorksheetFunction.Pi
    ElseIf lambda1 >= F2 Then
        alpha = 4.45
    Else
        If lambda2 >= 0.45 Then
            alpha = Application.Min(F3, 2 * WorksheetFunction.Pi)
        ElseIf lambda2 >= (0.2768 * lambda1) + 0.14 And lambda2 < 0.45 Then
            alpha = Application.Min(F4, 2 * WorksheetFunction.Pi)
        ElseIf lambda2 >= (1.2971 * lambda1) - 0.7782 And lambda2 < (0.2768 * lambda1) + 0.14 Then
            alpha = Application.Min(F5, 2 * WorksheetFunction.Pi)
        ElseIf lambda2 < (1.2971 * lambda1) - 0.7782 Then
            alpha = Application.Min(F6, 2 * WorksheetFunction.Pi)
        Else
            MsgBox "error in code"
        End If
    End If
End Function
```

Stay **DRY** (Don’t Repeat Yourself), not **WET** (Write Everything Twice)!
