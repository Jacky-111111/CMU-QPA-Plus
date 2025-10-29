# model.py
from pydantic import BaseModel, conint, constr, Field
from typing import List, Tuple

class QpaRequest(BaseModel):
    # grades: e.g. [[12, "A"], [9, "B"], ...]
    grades: List[Tuple[conint(gt=0), constr(min_length=1)]] = Field(
        ..., description="List of (units, letterGrade)"
    )
