import React, {Component, PropTypes} from 'react';
import Dialog from 'material-ui/lib/dialog';
import ReactDOM from 'react-dom';

const DLG_TYPE_WARNING = 'warning';
const DLG_TYPE_INFO = 'info';


export var SetInfoErrDialogMethods = function (ele) {

    ele.showErr = function (msg) {
        ele.setState({
            dlgType: DLG_TYPE_WARNING,
            dlgOpen: true,
            dlgmsg: msg
        });
    }

    ele.showInfo = function (msg) {
        ele.setState({
            dlgType: DLG_TYPE_INFO,
            dlgOpen: true,
            dlgmsg: msg
        });
    }

    ele.closeInfoErrDialog = function (){
        ele.setState({
            dlgOpen: false
        });
    }

}

export var SetInfoErrDialog = function (ele) {

    var dlgType = ele.state.dlgType ? ele.state.dlgType : DLG_TYPE_INFO;
    var dlgOpen = ele.state.dlgOpen ? ele.state.dlgOpen : false;

    return <Dialog title={ dlgType === DLG_TYPE_WARNING ? 'WARNING' : 'INFO'}  open={dlgOpen} onRequestClose={ele.closeInfoErrDialog.bind(ele)} >
               {ele.state.dlgmsg ? ele.state.dlgmsg : ""}
           </Dialog>
}
