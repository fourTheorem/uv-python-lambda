from common.car import Car

def handle_event(event, context):
    car = Car(brand="Nissan", model="Skyline", year=2022)
    return car.model_dump()
