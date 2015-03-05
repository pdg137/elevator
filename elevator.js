{
  init: function(elevators, floors) {
    var elevator = elevators[0];

    goToFloorNum = function(floorNum) {
      elevator.goToFloor(floorNum)
      setIndicators(elevator)
    }

    goToFloorNumUrgent = function(floorNum) {
      elevator.goToFloor(floorNum,true)
      setIndicators(elevator)
    }

    goToFloorFunction = function(floor) {
      return function() {
        goToFloorNum(floor.floorNum())
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

    elevator.on("passing_floor", function(floorNum) {
      if(elevator.goingUpIndicator() && upPressed[floorNum] ||
         elevator.goingDownIndicator() && downPressed[floorNum] ||
         elevator.getPressedFloors().indexOf(floorNum) != -1)
        goToFloorNumUrgent(floorNum)
    } )

    elevator.on("stopped_at_floor", function(floorNum) {
      setIndicators(elevator)
      if(elevator.goingUpIndicator())
        upPressed[floorNum] = false
      if(elevator.goingDownIndicator())
        downPressed[floorNum] = false
    } )

    elevator.on("idle", function() {
      if(elevator.getPressedFloors().length > 0) {
        goToFloorNum(elevator.getPressedFloors()[0])
        return
      }
      for(var i = 0 ; i < floors.length; i++) {
        if(upPressed[i]) {
          goToFloorNum(i);
          break;
        }
        if(downPressed[i]) {
          goToFloorNum(i);
          break;
        }
      }
    });
  },
  update: function(dt, elevators, floors) {
  }
}
