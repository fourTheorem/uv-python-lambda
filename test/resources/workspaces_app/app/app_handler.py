from common.car import Car

def handle_event(event, context):
    car = Car(brand="Toyota", model="Corolla", year=2020)
    return car.model_dump()
