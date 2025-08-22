// constants.js

// All components available in the simulator
export const LINE_COMPONENTS = [
  {
    id: "stm32",
    type: "microcontroller",
    label: "STM32",
    x: 200,
    y: 200,
    inputs: [],
    outputs: ["PA0", "PA1", "GND", "VCC"],
  },
  {
    id: "motor_driver",
    type: "driver",
    label: "Motor Driver",
    x: 600,
    y: 200,
    inputs: ["IN1", "IN2", "GND", "VCC"],
    outputs: ["OUT1", "OUT2"],
  },
  {
    id: "left_motor",
    type: "motor",
    label: "Left Motor",
    x: 900,
    y: 120,
    inputs: ["+ve", "-ve"],
    outputs: [],
  },
  {
    id: "right_motor",
    type: "motor",
    label: "Right Motor",
    x: 900,
    y: 280,
    inputs: ["+ve", "-ve"],
    outputs: [],
  },
  {
    id: "ir_sensor",
    type: "sensor",
    label: "IR Sensor",
    x: 200,
    y: 400,
    inputs: ["VCC", "GND"],
    outputs: ["OUT"],
  },
];

// ✅ Required wiring rules
export const REQUIRED_CONNECTIONS = [
  {
    id: "stm32_to_driver_in1",
    label: "STM32 PA0 → Motor Driver IN1",
    from: { nodeId: "stm32", port: "PA0" },
    to: { nodeId: "motor_driver", port: "IN1" },
  },
  {
    id: "stm32_to_driver_in2",
    label: "STM32 PA1 → Motor Driver IN2",
    from: { nodeId: "stm32", port: "PA1" },
    to: { nodeId: "motor_driver", port: "IN2" },
  },
  {
    id: "driver_out1_to_left_motor",
    label: "Motor Driver OUT1 → Left Motor +ve",
    from: { nodeId: "motor_driver", port: "OUT1" },
    to: { nodeId: "left_motor", port: "+ve" },
  },
  {
    id: "driver_out2_to_right_motor",
    label: "Motor Driver OUT2 → Right Motor +ve",
    from: { nodeId: "motor_driver", port: "OUT2" },
    to: { nodeId: "right_motor", port: "+ve" },
  },
  {
    id: "sensor_out_to_stm32",
    label: "IR Sensor OUT → STM32 PA0",
    from: { nodeId: "ir_sensor", port: "OUT" },
    to: { nodeId: "stm32", port: "PA0" },
  },
  {
    id: "sensor_power",
    label: "IR Sensor VCC → STM32 VCC",
    from: { nodeId: "ir_sensor", port: "VCC" },
    to: { nodeId: "stm32", port: "VCC" },
  },
  {
    id: "sensor_ground",
    label: "IR Sensor GND → STM32 GND",
    from: { nodeId: "ir_sensor", port: "GND" },
    to: { nodeId: "stm32", port: "GND" },
  },
  {
    id: "driver_power",
    label: "Motor Driver VCC → STM32 VCC",
    from: { nodeId: "motor_driver", port: "VCC" },
    to: { nodeId: "stm32", port: "VCC" },
  },
  {
    id: "driver_ground",
    label: "Motor Driver GND → STM32 GND",
    from: { nodeId: "motor_driver", port: "GND" },
    to: { nodeId: "stm32", port: "GND" },
  },
];
