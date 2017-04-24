import React, {Component, PropTypes} from 'react';
import Dialog from 'material-ui/lib/dialog';
import ReactDOM from 'react-dom';

const DLG_TYPE_WARNING = 'warning';
const DLG_TYPE_INFO = 'info';


const SetInfoErrDialogMethods = function (ele) {

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

const SetInfoErrDialog = function (ele) {

    var dlgType = ele.state.dlgType ? ele.state.dlgType : DLG_TYPE_INFO;
    var dlgOpen = ele.state.dlgOpen ? ele.state.dlgOpen : false;
    var titleColor = dlgType === DLG_TYPE_WARNING ? "red" : "green";

    return <Dialog title={ dlgType === DLG_TYPE_WARNING ? 'WARNING' : 'INFOMATION'} titleStyle={{color: titleColor, fontWeight: 'bold' }}  open={dlgOpen} onRequestClose={ele.closeInfoErrDialog.bind(ele)} >
               {ele.state.dlgmsg ? ele.state.dlgmsg : ""}
           </Dialog>
}

export {SetInfoErrDialog, SetInfoErrDialogMethods};
