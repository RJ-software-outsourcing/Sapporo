import React, {Component, PropTypes} from 'react';
import Dialog from 'material-ui/lib/dialog';
import ReactDOM from 'react-dom';

const DLG_TYPE_WARNING = 'warning';
const DLG_TYPE_INFO = 'info';

// This function MUST be called at contructor
export var IniEleWithInfoErrDialog = function (ele)
{
  ele.state.dlgType = DLG_TYPE_INFO; // info, warning
  ele.state.dlgOpen = false;
  ele.state.msg = "";
}

export var SetInfoErrDialog = function (ele) {

  ele.showErr = function (msg) {
     ele.setState({
      dlgType: DLG_TYPE_WARNING,
      dlgOpen: true,
      msg: msg
    })   
  }

  ele.showInfo = function (msg) {
      ele.setState({
      dlgType: DLG_TYPE_INFO,
      dlgOpen: true,
      msg: msg
    })       
  }

  ele.closeInfoErrDialog = function (){
    ele.setState({
      dlgOpen: false
    }) 
  }
  
  return <Dialog title={ ele.state.dlgType == DLG_TYPE_WARNING ? 'WARNING' : 'INFO'}  open={ele.state.dlgOpen} onRequestClose={ele.closeInfoErrDialog.bind(ele)} >
            {ele.state.msg}
         </Dialog>
}
