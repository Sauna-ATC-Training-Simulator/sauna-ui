import React from "react";
import { Formik, getIn } from 'formik';
import {Button, Col, Form, InputGroup, Modal, Row} from "react-bootstrap";
import * as Yup from "yup";

export default function AircraftListModal({ onClose, onAircraftSubmit, aircraft, aircrafts }) {

    const formSchema = Yup.object().shape({
        callsign: Yup.string()
            .required("Callsign is Required")
            .matches(/^[a-zA-Z0-9]+$/, "Alphanumeric characters only!")
            .test("unique-callsign", "Callsign already exists!", function (value) {
                const existingCallsigns = aircrafts
                    .filter(a => a.callsign !== aircraft?.callsign)
                    .map(a => a.callsign.toUpperCase());
                return !existingCallsigns.includes(value?.toUpperCase());
            }),
        pos: Yup.object().shape({
            lat: Yup.number()
                .required("Latitude is required")
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90"),
            lon: Yup.number()
                .required("Longitude is required")
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180"),
        }),
        alt: Yup.number()
            .required("Altitude is required")
            .max(99999, "The altitude cannot exceed 99,999ft"),
        squawk: Yup.string()
            .required("Squawk required")
            .matches(/^[0-7]{4}$/, "Squawk must be between 0000-7777"),
        dep: Yup.string()
            .required("Departure airport is required")
            .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric characters only!")
            .matches(/^.{3,4}$/, "Needs to be atleast 3 characters!"),
        arr: Yup.string()
        .required("Destination airport is required")
        .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric characters only!")
        .matches(/^.{3,4}$/, "Needs to be atleast 3 characters!"),
        fp: Yup.object().shape({
            route: Yup.string()
                .required("Flight Plan route is required"),
            fpalt: Yup.number()
            .required("Altitude is required")
            .min(0, "The altitude has to be atleast 0")
            .max(99999, "The altitude cannot exceed 99,999ft"),
            tas: Yup.number()
                .min(0, "Airspeed has to be atleast 1"),
        })

    })

    const onSubmit = async (values) => {
        onAircraftSubmit(values)
        onClose();
    };

    const handleChangeUpperCase = (handleChangeFunction) => {
        return (e) => {
            e.target.value = e.target.value.toUpperCase()
            handleChangeFunction(e)
        }
    }
    return (
        <Modal
            show onHide={onClose}
            backdrop="static"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{aircraft ? "Edit Aircraft" : "Add Aircraft"}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={aircraft? aircraft:{

                    callsign: "",
                    pos: {
                        lat: "",
                        lon: "",
                    },
                    alt: "",
                    acftType: "",
                    squawk: "",
                    dep: "",
                    arr: "",
                    fp: {
                        route: "",
                        fpalt: "",
                        tas: "",
                        flightRules: "I",
                    },
                }}
                validationSchema={formSchema}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>Callsign</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="callsign"
                                            value={values.callsign}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={touched.callsign && !!errors.callsign}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.callsign}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label>Aircraft Type</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="acftType"
                                            value={values.acftType}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "acftType") && getIn(errors, "acftType")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "acftType")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>Latitude</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="pos.lat"
                                            type="number"
                                            value={values.pos.lat}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "pos.lat") && getIn(errors, "pos.lat")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "pos.lat")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label>Longitude</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="pos.lon"
                                            type="number"
                                            value={values.pos.lon}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "pos.lon") && getIn(errors, "pos.lon")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "pos.lon")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>Altitude</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="alt"
                                            type="number"
                                            value={values.alt}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "alt") && getIn(errors, "alt")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "alt")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label>Squawk</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="squawk"
                                            value={values.squawk}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "squawk") && getIn(errors, "squawk")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "squawk")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>Departure</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="dep"
                                            value={values.dep}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "dep") && getIn(errors, "dep")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "dep")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label>Arrival</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="arr"
                                            value={values.arr}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "arr") && getIn(errors, "arr")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "arr")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Label>Flight Plan Route</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="fp.route"
                                            value={values.fp.route}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "fp.route") && getIn(errors, "fp.route")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "fp.route")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={4}>
                                    <Form.Label>Cruise Altitude</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="fp.fpalt"
                                            type="number"
                                            value={values.fp.fpalt}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "fp.fpalt") && getIn(errors, "fp.fpalt")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "fp.fpalt")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={4}>
                                    <Form.Label>Cruise Speed</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="fp.tas"
                                            type="number"
                                            value={values.fp.tas}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "fp.tas") && getIn(errors, "fp.tas")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "fp.tas")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={4}>
                                    <Form.Label>Flight Rules</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Select
                                            name="fp.flightRules"
                                            value={values.fp.flightRules}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "fp.flightRules") && getIn(errors, "fp.flightRules")}
                                        >
                                            <option value="I">IFR</option>
                                            <option value="V">VFR</option>
                                            <option value="D">DVFR</option>
                                            <option value="S">SVFR</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "fp.flightRules")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
