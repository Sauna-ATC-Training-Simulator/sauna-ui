import React, {Component} from "react";
import {Formik, Field, getIn} from "formik";
import {getStoreItem, getUiSettings, saveUiSettings} from "../../actions/local_store_actions";
import {getFsdProtocolRevisions} from "../../actions/enum_actions";
import {updateServerSettings} from "../../actions/data_actions";
import {Button, Col, Form, InputGroup, Modal, Row} from "react-bootstrap";
import * as Yup from "yup";

export class SettingsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            protocolRevisions: [],
            showModal: false
        }
    }

    open = () => {
        this.setState({showModal: true});
    }

    close = () => {
        this.setState({showModal: false});
    }

    async componentDidMount() {
        const revisions = await getFsdProtocolRevisions();
        console.log(revisions);
        this.setState({
            protocolRevisions: revisions
        });
    }

    getProtocolRevisionOptions = () => {
        return this.state.protocolRevisions.map((rev) =>
            <option key={`protocol-revision-${rev}`} value={rev}>{rev}</option>);
    }

    onSubmit = async (values) => {
        saveUiSettings(values);
        await updateServerSettings(getStoreItem("settings.apiSettings"));
        this.close();
    }

    render() {
        const formSchema = Yup.object().shape({
            apiServer: Yup.object().shape({
                hostName: Yup.string()
                    .required("Required"),
                port: Yup.number()
                    .required("Required")
                    .min(1, "1 or more")
                    .max(65535, "65635 or less")
            }),
            apiSettings: Yup.object().shape({
                posCalcRate: Yup.number()
                    .required("Required")
                    .min(50, "50 or more")
                    .max(5000, "5000 or less"),
                commandFrequency: Yup.string()
                    .required("Required")
                    .matches(/^[1][0-9][0-9]\.[0-9]{1,3}$/, "Invalid frequency")
            }),
            fsdConnection: Yup.object().shape({
                hostname: Yup.string()
                    .required("Required"),
                port: Yup.number()
                    .required("Required")
                    .min(1, "1 or more")
                    .max(65535, "65635 or less"),
                networkId: Yup.string()
                    .required("Required"),
                password: Yup.string()
                    .required("Required")
            })
        })
        return (
            <>
                <Button variant={"secondary"} onClick={this.open}>Settings</Button>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Settings</Modal.Title>
                    </Modal.Header>
                    <Formik
                        initialValues={getUiSettings()}
                        onSubmit={this.onSubmit}
                        validationSchema={formSchema}>
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              isSubmitting,
                          }) => (
                            <Form onSubmit={handleSubmit}>
                                <Modal.Body>
                                    <h5>Sauna API Server Settings</h5>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} sm={9} xs={8} controlId={"settingsFormApiHostName"}>
                                            <Form.Label>Hostname</Form.Label>
                                            <Form.Control
                                                name="apiServer.hostName"
                                                value={values.apiServer.hostName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "apiServer.hostName") && getIn(errors, "apiServer.hostName")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "apiServer.hostName")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} sm={3} xs={4} controlId={"settingsFormApiPort"}>
                                            <Form.Label>Port</Form.Label>
                                            <Form.Control
                                                name="apiServer.port"
                                                type="number"
                                                value={values.apiServer.port}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "apiServer.port") && getIn(errors, "apiServer.port")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "apiServer.port")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col sm={6}>
                                            <Form.Label>Position Calculation Rate</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name="apiSettings.posCalcRate"
                                                    value={values.apiSettings.posCalcRate}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={getIn(touched, "apiSettings.posCalcRate") && getIn(errors, "apiSettings.posCalcRate")}
                                                />
                                                <InputGroup.Text>ms</InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, "apiSettings.posCalcRate")}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label>Command Frequency</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name="apiSettings.commandFrequency"
                                                    value={values.apiSettings.commandFrequency}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={getIn(touched, "apiSettings.commandFrequency") && getIn(errors, "apiSettings.commandFrequency")}
                                                />
                                                <InputGroup.Text>MHz</InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, "apiSettings.commandFrequency")}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                    </Row>

                                    <h5>FSD Connection Info</h5>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} sm={5} controlId={"settingsFormFsdHostName"}>
                                            <Form.Label>Hostname</Form.Label>
                                            <Form.Control
                                                name="fsdConnection.hostname"
                                                value={values.fsdConnection.hostname}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "fsdConnection.hostname") && getIn(errors, "fsdConnection.hostname")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "fsdConnection.hostname")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} sm={3} controlId={"settingsFormFsdPort"}>
                                            <Form.Label>Port</Form.Label>
                                            <Form.Control
                                                name="fsdConnection.port"
                                                type="number"
                                                value={values.fsdConnection.port}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "fsdConnection.port") && getIn(errors, "fsdConnection.port")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "fsdConnection.port")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} sm={4} controlId={"settingsFormFsdProtocol"}>
                                            <Form.Label>Protocol Version</Form.Label>
                                            <Form.Select
                                                name="fsdConnection.protocol"
                                                value={values.fsdConnection.protocol}
                                                onChange={handleChange}>
                                                {this.getProtocolRevisionOptions()}
                                            </Form.Select>
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} sm={6} controlId={"settingsFormFsdNid"}>
                                            <Form.Label>Network ID</Form.Label>
                                            <Form.Control
                                                name="fsdConnection.networkId"
                                                value={values.fsdConnection.networkId}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "fsdConnection.networkId") && getIn(errors, "fsdConnection.networkId")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "fsdConnection.networkId")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group as={Col} sm={6} controlId={"settingsFormFsdPass"}>
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                name="fsdConnection.password"
                                                type="password"
                                                value={values.fsdConnection.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={getIn(touched, "fsdConnection.password") && getIn(errors, "fsdConnection.password")}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {getIn(errors, "fsdConnection.password")}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={this.close} disabled={isSubmitting}>
                                        Close
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        Save
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </>
        )
    }
}