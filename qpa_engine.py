def calculateQPA(Grades):
    # We assume the list of grades is like [(units, letter grade), ...]
    totalUnits = 0
    totalQualityPoints = 0
    for each in Grades:
        units, letterGrade = each
        qualityPoints = letterGradeToQualityPoints(letterGrade)
        totalUnits += units
        totalQualityPoints += units * qualityPoints
    QPA = round(totalQualityPoints / totalUnits, 2)
    print(QPA)
    return QPA

def letterGradeToQualityPoints(letterGrade):
    gradeDict = {
        "A":4.0,
        "B":3.0,
        "C":2.0,
        "D":1.0,
    }
    return gradeDict.get(letterGrade, 0.0)

calculateQPA([ (12, "A"), (9, "C"), (9, "A"), (9, "A") ])