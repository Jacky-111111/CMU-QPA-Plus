# qpa_engine.py

def calculateQPA(Grades):
    # We assume the list of grades is like [(units, letter grade), ...]
    totalUnits = 0
    totalPoints = 0
    totalQualityPoints = 0

    for units, letterGrade in Grades:
        points = letterGradeToPoints(letterGrade)
        qualityPoints = points * units

        totalPoints += points
        totalUnits += units
        totalQualityPoints += qualityPoints

    QPA = round(totalQualityPoints / totalUnits, 2)
    GPA = round(totalPoints / len(Grades), 2)

    return {
        "QPA": QPA,
        "totalUnits": totalUnits,
        "totalQualityPoints": totalQualityPoints,
        "GPA": GPA
    }


def letterGradeToPoints(letterGrade):
    gradeDict = {
        "A": 4.0,
        "B": 3.0,
        "C": 2.0,
        "D": 1.0,
    }
    return gradeDict.get(letterGrade, 0.0)