import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Timer from './Timer.jsx';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';

const styles = {
    gridList: {
        width: '100%',
        overflowY: 'auto',
        marginTop:'10px'
    }
};
const cellHeight = function () {
    if (window.innerWidth > 1600) {
        return 400;
    } else {
        return 200;
    }
};

const getTimerTile = function (timer) {
    const timeStyle = {
        height: 'inherit',
        textAlign:'center',
        lineHeight: String(cellHeight())+'px',
        fontSize: String(cellHeight())+'%',
        fontWeight: 'bold'
    };
    return(
        <div style={timeStyle}>
            {timer}
        </div>
    );
};

class Dashboard extends Component {
    tileStyle(tile) {
        return {
            backgroundImage: 'url("' + tile.image + '")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        };
    }

    getContent (tile) {
        let contentStyle = {
            height: 'inherit',
            backgroundColor: tile.backgroundColor? tile.backgroundColor:'rgba(255,255,255,0.4)'
        };
        return (
            <div style={contentStyle}>
                {tile.content}
            </div>
        );
    }
    render () {
        const tilesData = [{
            title: 'Hi ' + Meteor.user().username,
            featured: true,
            cols: 2,
            image: '/images/1.jpg'
        }, {
            title: 'Live Feed Messages',
            cols: 2,
            image: '/images/6.jpg'
        }, {
            title: 'Time',
            cols: 2,
            image: '/images/3.jpg',
            backgroundColor: 'rgba(255,255,255,0.8)',
            content: getTimerTile(<Timer/>)
        }, {
            title: 'Total Score',
            featured: true,
            cols: 1.5,
            image: '/images/4.jpg'
        }, {
            title: 'Passed Problems',
            cols: 1.5,
            image: '/images/5.jpg'
        }, {
            title: 'Online Help',
            featured: true,
            cols: 1.5,
            image: '/images/3.jpg'
        }, {
            title: 'About Us',
            cols: 1.5,
            image: '/images/5.jpg'
        }];
        return (
            <div>
                <GridList cols={6} cellHeight={cellHeight()} padding={5} style={styles.gridList}>
                          {tilesData.map((tile, key) => (
                    <GridTile key={key} title={tile.title}
                              actionPosition="left" titlePosition="bottom"
                              titleBackground="rgba(0, 0, 0, 0.6)" children={this.getContent(tile)}
                              cols={tile.cols} rows={1} style={this.tileStyle(tile)}>
                    </GridTile>
                  ))}
                </GridList>
            </div>
        );
    }
}

Dashboard.propTypes = {
    currentUser: PropTypes.object
};

export default createContainer(() => {
    return {
        currentUser: Meteor.user()
    };
}, Dashboard);
