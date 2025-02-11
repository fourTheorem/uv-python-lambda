from pydantic import BaseModel

class Car(BaseModel):
    brand: str
    model: str
    year: int
