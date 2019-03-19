import React, {Component} from 'react';
import './ReviewItem.css';

class ReviewItem extends Component {

    render() {
      let style;
      if (this.props.opinion === 'con'){
        style = 'border-danger'
      } else {
        style = 'border-success'
      }
        return (
            <div className={"card card-review grid-item "+style}>
              <div className="card-body p-2 text-left">
                {this.props.item}
              </div>
            </div>
        );
    }
}

export default ReviewItem;
