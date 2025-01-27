import React from "react";
import {open} from '@tauri-apps/plugin-dialog';
import {loadEuroscopeScenario} from "../../actions/data_actions";
import {Button, ButtonGroup, OverlayTrigger, Tooltip} from "react-bootstrap";
import {SettingsModal} from "../settings/settings";
import {NavigraphAuthButton} from "../settings/navigraph_auth";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileCirclePlus, faMap, faMessage, faPlane} from "@fortawesome/free-solid-svg-icons";
import {SectorFilesButton} from "../settings/sector_files_button";
import {createCommandWindow, createMapWindow} from "../../actions/tauri_actions";

export const DataPage = ({}) => {
    const openMapPage = async () => {
        await createMapWindow();
    }

    const chooseEsFile = async () => {
        const selected = await open({
            title: "Select Euroscope Scenario File",
            multiple: true,
            filters: [{
                name: "Euroscope Scenario File",
                extensions: ["txt"]
            }]
        });

        if (selected !== null) {
            if (Array.isArray(selected)) {
                // Multiple scenario files selected
                for (const filename of selected) {
                    await loadEuroscopeScenario(filename);
                }
            } else {
                // Single file selected
                await loadEuroscopeScenario(selected);
            }
        }
    }

    const renderEsScenarioTooltip = (props) => (
        <Tooltip id="es-scenario-button-tooltip" {...props}>
            Load EuroScope Scenario File
        </Tooltip>
    );
    const renderMapTooltip = (props) => (
        <Tooltip id="map-button-tooltip" {...props}>
            Open Map Window
        </Tooltip>
    );

    const renderCommandTooltip = (props) => (
        <Tooltip id="command-button-tooltip" {...props}>
            Open Command Window
        </Tooltip>
    )

    return (
        <>
            <div className={"mb-2 float-end"}>
                <OverlayTrigger overlay={renderCommandTooltip}
                                placement={"bottom"}
                                delay={{show: 250, hide: 400}}>
                    <Button variant={"secondary"} onClick={createCommandWindow}>
                        <FontAwesomeIcon icon={faMessage} />
                    </Button>
                </OverlayTrigger>{' '}

                <OverlayTrigger
                    placement="bottom"
                    delay={{show: 250, hide: 400}}
                    overlay={renderMapTooltip}
                >
                    <Button variant={"secondary"} onClick={openMapPage}
                    ><FontAwesomeIcon icon={faMap}/></Button>
                </OverlayTrigger>{' '}

                <ButtonGroup>
                    <NavigraphAuthButton/>
                    <SectorFilesButton/>
                </ButtonGroup>{' '}
                <OverlayTrigger
                    placement="bottom"
                    delay={{show: 250, hide: 400}}
                    overlay={renderEsScenarioTooltip}
                >
                    <Button variant={"primary"} onClick={chooseEsFile}
                    ><FontAwesomeIcon icon={faFileCirclePlus}/> <FontAwesomeIcon icon={faPlane}/> ES</Button>
                </OverlayTrigger>{' '}
                <SettingsModal/>
            </div>
        </>
    )
}