import React from 'react';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import AircraftListModal from './aircraft_list_modal';

export default function AircraftList({aircrafts, setAircrafts}) {
    const [showModal, setShowModal] = React.useState(false);

    const onAircraftAdd = (aircraft) => {        
        aircrafts.push(aircraft)        
        setAircrafts(aircrafts)
    }
    return (
        <div>
            <Button variant="secondary" onClick={() => setShowModal(true)}>
                Add Aircraft
            </Button>
            {showModal && (
                <AircraftListModal
                    onClose={() => setShowModal(false)}
                    onAircraftAdd = {onAircraftAdd}
                />
            )}
                
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Callsign</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Altitude</th>
                        <th>Aircraft Type</th>
                        <th>Squawk</th>
                        <th>Dep</th>
                        <th>Arr</th>
                        <th>Route</th>
                        <th>Crz Alt</th>
                        <th>Crz Tas</th>
                        <th>Flight Rules</th>
                    </tr>
                </thead>
                <tbody>
                    {aircrafts.map((aircraft, index) => (
                        <tr key={index}>
                            <td>{aircraft.callsign}</td>
                            <td>{aircraft.pos.lat}</td>
                            <td>{aircraft.pos.lon}</td>
                            <td>{aircraft.alt}</td>
                            <td>{aircraft.acftType}</td>
                            <td>{aircraft.squawk}</td>
                            <td>{aircraft.dep}</td>
                            <td>{aircraft.arr}</td>
                            <td>{aircraft.fp.route}</td>
                            <td>{aircraft.fp.fpalt}</td>
                            <td>{aircraft.fp.tas}</td>
                            <td>{aircraft.fp.flightRules}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
        
    );
}