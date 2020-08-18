declare module 'easy-fit' {
  export type Options = {
    force?: boolean
    speedUnit?: string
    lengthUnit?: string
    temperatureUnit?: string
    elapsedRecordField?: boolean
    mode?: string
  }

  export type Session = {
    timestamp: Date
    start_time: Date
    start_position_lat: number
    start_position_long: number
    total_elapsed_time: number
    total_timer_time: number
    total_distance: number
    total_cycles: number
    nec_lat: number
    nec_long: number
    swc_lat: number
    swc_long: number
    avg_power_position: number
    max_power_position: number
    message_index: number
    total_calories: number
    avg_speed: number
    max_speed: number
    avg_power: number
    max_power: number
    total_ascent: number
    total_descent: number
    first_lap_index: number
    num_laps: number
    normalized_power: number
    training_stress_score: number
    intensity_factor: number
    left_right_balance: number
    threshold_power: number
    num_active_lengths: number
    avg_vertical_oscillation: number
    avg_stance_time_percent: number
    avg_stance_time: number
    stand_count: number
    event: string
    event_type: string
    sport: string
    sub_sport: string
    avg_heart_rate: number
    max_heart_rate: number
    avg_cadence: number
    max_cadence: number
    trigger: string
    avg_temperature: number
    max_temperature: number
    avg_fractional_cadence: number
    max_fractional_cadence: number
  }

  export type Lap = {
    timestamp: Date
    start_time: Date
    start_position_lat: number
    start_position_long: number
    end_position_lat: number
    end_position_long: number
    total_elapsed_time: number
    total_timer_time: number
    total_distance: number
    total_cycles: number
    avg_power_position: number
    max_power_position: number
    message_index: number
    total_calories: number
    total_fat_calories: number
    avg_speed: number
    max_speed: number
    avg_power: number
    max_power: number
    total_ascent: number
    total_descent: number
    normalized_power: number
    left_right_balance: number
    first_length_index: number
    wkt_step_index: number
    avg_vertical_oscillation: number
    avg_stance_time_percent: number
    avg_stance_time: number
    stand_count: number
    event: string
    event_type: string
    avg_heart_rate: number
    max_heart_rate: number
    avg_cadence: number
    max_cadence: number
    intensity: number
    lap_trigger: string
    sport: string
    sub_sport: string
    avg_temperature: number
    max_temperature: number
    avg_fractional_cadence: number
    max_fractional_cadence: number
  }

  export type Record = {
    timestamp: Date
    position_lat: number
    position_long: number
    distance: number
    altitude: number
    speed: number
    heart_rate: number
    cadence: number
    temperature: number
    fractional_cadence: number
    elapsed_time: number
  }

  export type Event = {
    timestamp: Date
    data: number
    event: string
    event_type: string
    event_group: number
  }

  export type Activity = {
    user_profile: {
      weight: number
      gender: string
      height: number
      language: string
      elev_setting: string
      weight_setting: string
      resting_heart_rate: number
      hr_setting: string
      speed_setting: string
      dist_setting: string
      activity_class: string
      position_setting: string
      temperature_setting: string
      height_settings: string
    }
    sport: {
      name: number
      sport: string
      sub_sport: string
    }
    zones_target: {
      functional_threshold_power: number
      max_heart_rate: number
      hr_calc_type: string
      pwer_calc_type: string
    }
    activity: {
      timestamp: Date
      total_timer_time: number
      local_timestamp: unknown
      num_sessions: number
      type: string
      event: string
      event_type: string
    }
    sessions: Session[]
    laps: Lap[]
    records: Record[]
    events: Event[]
  }

  type ParseCallback = (err: string | null, activity: Activity) => void

  export default class EasyFit {
    constructor(options: Options);

    parse(content: Buffer, callback: ParseCallback): any;
  }
}
