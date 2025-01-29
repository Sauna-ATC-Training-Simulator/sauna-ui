import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Formik} from "formik";
import {getScopePackageMapName, isScopePackageLoaded} from "../../actions/scope_package_actions.js";

export const FiltersModal = ({display, visibleFeatures, setVisibleFeatures, children}) => {
    const [show, setShow] = useState(false);
    const [initValues, setInitValues] = useState({});
    const [availValues, setAvailValues] = useState({});

    useEffect(() => {
        (async () => {
            if (!display || !display.display || !display.display.display_items || !await isScopePackageLoaded()) {
                setInitValues({});
                setAvailValues({});
            } else {
                let values = {};
                let availValues = {};
                for (const item of display.display.display_items) {
                    if (item.Map && !item.Map.visible) {
                        const mapName = await getScopePackageMapName(item.Map.id);
                        if (mapName) {
                            values[item.Map.id] = visibleFeatures.some((f) => f.type === "map" && f.id === item.Map.id);
                            availValues[item.Map.id] = mapName;
                        }
                    }
                }

                setInitValues(values);
                setAvailValues(availValues);
            }
        })();
    }, [display, visibleFeatures]);

    const handleShow = () => {
        setShow(true);
    }

    const handleClose = () => {
        setShow(false);
    }

    const onSubmit = (values) => {
        let retVal = [];
        for (const item of Object.keys(values)) {
            if (values[item]) {
                retVal.push({
                    type: "map",
                    id: item
                });
            }
        }
        setVisibleFeatures(retVal);
        handleClose();
    }

    return (
        <>
            {children({handleShow})}

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Filters</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={initValues}
                    onSubmit={onSubmit}
                    enableReinitialize={true}>
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          setFieldValue
                      }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Button variant="info" onClick={() => {
                                    for (const key of Object.keys(availValues)) {
                                        setFieldValue(key, true);
                                    }
                                }}>Select All</Button>
                                {Object.keys(availValues).map((key) => (
                                    <Form.Group>
                                        <Form.Check
                                            key={key}
                                            type="checkbox"
                                            label={availValues[key]}
                                            name={key}
                                            onChange={handleChange}
                                            checked={values[key]}
                                        />
                                    </Form.Group>
                                ))}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    Apply
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    )
}