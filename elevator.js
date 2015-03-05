{
  init: function(elevators, floors) {
    goToFloorNum = function(elevator, floorNum) {
      elevator.goToFloor(floorNum)
      setIndicators(elevator)
    }

    goToFloorNumUrgent = function(elevator, floorNum) {
      elevator.goToFloor(floorNum,true)
      setIndicators(elevator)
    }

    goToFloorFunction = function(elevator, floor) {
      return function() {
        goToFloorNum(elevator, floor.floorNum())
      }
    }
    upPressedFunction = function(floor) {
      return function() {
        upPressed[floor.floorNum()] = true
      }
    }

    downPressedFunction = function(floor) {
      return function() {
        downPressed[floor.floorNum()] = true
      }
    }

    setIndicators = function(elevator) {
      queue = elevator.destinationQueue
      floorNum = elevator.currentFloor()

      if(queue.length > 0) {
        if(queue[0] > floorNum) {
          elevator.goingUpIndicator(true)
          elevator.goingDownIndicator(false)
        }
        if(queue[0] < floorNum) {
          elevator.goingUpIndicator(false)
          elevator.goingDownIndicator(true)
        }
      }
      else {
        elevator.goingUpIndicator(true)
        elevator.goingDownIndicator(true)
      }
    }

    var upPressed = []
    var downPressed = []
    for(var i = 0 ; i < floors.length; i++) {
      upPressed[i] = false
      downPressed[i] = false
      floor = floors[i]
      floor.on("up_button_pressed", upPressedFunction(floor))
      floor.on("down_button_pressed", downPressedFunction(floor))
    }

    elevatorPassingFloorFunction = function(elevator) {
      return function(floorNum) {
        if(elevator.goingUpIndicator() && upPressed[floorNum] ||
           elevator.goingDownIndicator() && downPressed[floorNum] ||
           elevator.getPressedFloors().indexOf(floorNum) != -1)
          goToFloorNumUrgent(elevator,floorNum)
      }
    }

    elevatorStoppedFunction = function(elevator) {
      return function(floorNum) {
        setIndicators(elevator)
        if(elevator.goingUpIndicator())
          upPressed[floorNum] = false
        if(elevator.goingDownIndicator())
          downPressed[floorNum] = false
      }
    }

    elevatorIdleFunction = function(elevator) {
      return function() {

        if(elevator.getPressedFloors().length > 0) {
          goToFloorNum(elevator, elevator.getPressedFloors()[0])
          return
        }

        for(var i = 0 ; i < floors.length; i++) {
          if(upPressed[i]) {
            goToFloorNum(elevator, i);
            return
          }
          if(downPressed[i]) {
            goToFloorNum(elevator, i);
            return
          }
        }

      }
    }

    for(var i = 0; i < elevators.length; i++) {
      elevator = elevators[i]
      elevator.on("passing_floor", elevatorPassingFloorFunction(elevator))
      elevator.on("stopped_at_floor", elevatorStoppedFunction(elevator))
      elevator.on("idle", elevatorIdleFunction(elevator))
    }
  },
  update: function(dt, elevators, floors) {
  }
}
