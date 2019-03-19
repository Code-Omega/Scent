import React, {Component} from 'react';
import './AttrItem.css';

class AttrItem extends Component {

    render() {
      let style;
      if (this.props.is_selected){
        style = 'active-attr'
      } else {
        style = ''
      }
        return (
            <button className={"card card-att grid-item "+style} onClick={() => this.props.onclickfn(this.props.name)}>
              <div className="card-body p-2 text-center">
                {this.props.item}
              </div>
            </button>
        );
    }
}

export default AttrItem;
