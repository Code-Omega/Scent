import React, {Component} from 'react';
import './PostItem.css';

class PostItem extends Component {

    render() {
        return (
            <div className={"card card-post grid-item"}>
              <div className="card-body p-2 text-left">
                <a href={this.props.discussion_url} target="#">{this.props.item}</a>
                <span className="blockquote-footer">{this.props.tagline}</span>
              </div>
            </div>
        );
    }
}

export default PostItem;
