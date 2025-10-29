from qpa_engine import calculateQPA

def test_qpa():
    result = calculateQPA([
        {"units": 9, "letter": "A"},
        {"units": 12, "letter": "B+"}
    ])
    assert round(result["qpa"], 2) == round((9*4.0 + 12*3.33) / (9+12), 2)