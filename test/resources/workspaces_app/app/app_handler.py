from pydantic import BaseModel

class Car(BaseModel):
    brand: str
    model: str
    year: int

def handle_event(event, context):
    car = Car(brand="Toyota", model="Corolla", year=2020)
    return car.model_dump()