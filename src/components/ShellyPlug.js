import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'

const ShellyPlug = ({device, http, tile, mqtt, useHttp, useMqtt, useMqttSub}) => {

    const device_state = useSelector(state => state.DeviceController.data[tile.id], shallowEqual) || {}
    const client = useMqtt()
    let is_on = device_state[http['get_state']] && device_state[http['get_state']]?.ison ? true: false

    if(device_state[mqtt['get_state']]) {
        is_on = device_state[mqtt['get_state']] === 'on' ? true: false
    }

    useMqttSub(client, mqtt['get_state'], tile.id)
    useMqttSub(client, mqtt['get_power'], tile.id)
    useMqttSub(client, mqtt['get_overpower'], tile.id)
    useMqttSub(client, mqtt['get_energy'], tile.id)

    useHttp(device.id, tile.id, http['get_state'])
    useHttp(device.id, tile.id, http['get_meter'])
    
    const handleClick = () => client.publish(mqtt['toggle'], 'toggle')

    const showPower = () => {
        
        let power = 0.00

        if(device_state[http['get_meter']]?.power) {
            power = device_state.power
        }

        if(device_state[mqtt['get_power']]) {
            power = device_state[mqtt['get_power']]
        }

        if(!is_on) {
            power = 0
        }

        return (
            <div>
                <span className="faccented">{power}</span>
                <span className="f12">W</span>
            </div>
        )
    }

    const showEnergy = () => {

        let energy = 0

        if(device_state[http['get_meter']]?.total) {
            energy = device_state[http['get_meter']]?.total
        }

        if(device_state[mqtt['get_energy']]) {
            energy = device_state[mqtt['get_energy']]
        }

        if(energy > 0) {
            energy = (energy * 17) / 1000000
            return (
                <div>
                    <span className="faccented">{energy.toFixed(2)}</span>
                    <span className="f12">kWh</span>
                </div>
            )
        }
    }

    let style = {
        width: '100%',
        cursor: 'pointer',
        color: '' 
    }

    if(is_on) {
        style.color = '#6fc796' 
    }

    if(device_state[http['get_meter']]?.overpower > 0 || (device_state[mqtt['get_overpower']] > 0)) {
        style.color = '#f1888b'
    }
    
    return (
        <div className="txt_center">
            <span 
                onClick={() => handleClick()} 
                style={style} 
                className="tile-icon material-icons f75"
            >power_settings_new</span>
            {showPower()}
            {showEnergy()}
        </div>
    )
}

export default ShellyPlug