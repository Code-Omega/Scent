import React, {Component} from 'react';
import axios from "axios";
import _ from 'lodash';
import './MainView.css';
import AttrItem from './components/AttrItem';
import ReviewItem from './components/ReviewItem';
import PostItem from './components/PostItem';
import App from './components/D3FDG';
import Logo from './assets/logo.png';


class MainView extends Component {
  constructor(props) {
      super(props);
      this.state = {
          // this is where the data goes
          attribute_list: [],
          reviews: {},
          posts: {},
          selected_attrs: new Set([]),
          filtered_reviews: [],
          filtered_posts: []
      };
  };

  getNoun = () => {
    fetch("/api/getNoun")
      .then(data => data.json())
      .then(res => this.setState({ attribute_list: res.data }));
  };

  testing = () => {
    const sn_posts = [...this.state.filtered_posts.map((item, key) => ({
                          name: item.name,
                          niches: [...new Set(item.tagline.toLowerCase().split(" "))],
                          id: item.id
                        }))
                      ]
    const niches = _.reduce(sn_posts, function(result, post){
      return _.reduce(post.niches, function(acc, niche){
        (acc[niche] || (acc[niche] = [])).push({id:post.id, niche:niche});
        return acc;
      }, result);
    }, {});
    const niches_with_1_plus = _.pickBy(niches, function(x) { return x.length>1; });
    console.log(niches_with_1_plus);
  };

  getByLemma = (lemma) => {
    this.setState(({ selected_attrs }) => {
      if (selected_attrs.has(lemma)) {
        let new_obj = new Set(selected_attrs);
        new_obj.delete(lemma);
        return ({ selected_attrs: new_obj })
      } else {
        return ({ selected_attrs: new Set(selected_attrs).add(lemma) })
      }
    }, () => {
      if (this.state.selected_attrs.has(lemma)) {
        fetch("/api/getByLemma/"+lemma)
        .then(data => data.json())
        .then(res => this.setState(({ reviews, posts }) => ({
          reviews: {...reviews, [lemma] : res.data.reviews},
          posts: {...posts, [lemma] : res.data.posts}
        })))
        .then(res => this.setState(({ filtered_reviews, filtered_posts, reviews, posts }) => ({
          filtered_reviews: _.intersectionBy(...Object.values(reviews).filter(function(el) { return el; }),'id'),
          filtered_posts: _.intersectionBy(...Object.values(posts).filter(function(el) { return el; }),'id')
        })))
      } else {
        this.setState(({ reviews, posts }) => ({
          reviews: {...reviews, [lemma]: undefined},
          posts: {...posts, [lemma]: undefined}
        }), () => {
          this.setState(({ filtered_reviews, filtered_posts, reviews, posts }) => ({
            filtered_reviews: _.intersectionBy(...Object.values(reviews).filter(function(el) { return el; }),'id'),
            filtered_posts: _.intersectionBy(...Object.values(posts).filter(function(el) { return el; }),'id')
          }))
        });
      }
    });
  };

  createGraphComponents = () => {
    const sn_posts = [...this.state.filtered_posts.map((item, key) => ({
                          name: item.name,
                          niches: [...new Set(item.niches)],
                          id: item.id
                        }))
                      ]
    const niches = _.reduce(sn_posts, function(result, post){
      return _.reduce(post.niches, function(acc, niche){
        (acc[niche] || (acc[niche] = [])).push({id:post.id, niche:niche});
        return acc;
      }, result);
    }, {});
    const niches_with_1_plus = _.pickBy(niches, function(x) { return x.length>1; });
    const niche_names = Object.keys(niches_with_1_plus).map((item, key) => ({name:item, id:item}));
    const niche_elems = _.flatten(Object.values(niches_with_1_plus));
    return {
      nodes: [...this.state.filtered_reviews.map((item, key) => ({
                name: '',
                id: item.id,
                type: "review "+item.opinion,
                text: "["+item.opinion+"] "+item.text
              })),
              ...this.state.filtered_posts.map((item, key) => ({
                name: item.name.substring(0,1),
                id: item.id,
                type: "post",
                text: "["+item.name+"] - "+item.tagline
              })),
              ...niche_names.map((item, key) => ({
                name: "",
                id: item.id,
                type: "niche",
                text: item.name
              }))
            ],
      links: [...this.state.filtered_reviews.map((item, key) => ({
                source: item.post_id,
                target: item.id,
                type: "review",
                id: key
              })),
              ...niche_elems.map((item, key) => ({
                source: item.niche,
                target: item.id,
                type: "niche",
                id: key+this.state.filtered_reviews.length
              }))
            ]
    }
  };

  putDataToDB = message => {
    axios.post("/api/putData", {
      todo: "new todo"
    });
  };

  createNewToDoItem = () => {
    this.setState(({ list, todo }) => ({
      list: [
          ...list,
        {
          todo
        }
      ],
      todo: ''
    }));
  };


  handleKeyPress = e => {
    if (e.target.value !== '') {
      if (e.key === 'Enter') {
        this.createNewToDoItem();
      }
    }
  };

  handleInput = e => {
    this.setState({
      todo: e.target.value
    });
  };


  // this is now being emitted back to the parent from the child component
  deleteItem = indexToDelete => {
    this.setState(({ list }) => ({
      list: list.filter((toDo, index) => index !== indexToDelete)
    }));
  };

  componentDidMount() {
    this.getNoun();
  };

  render() {
    return (
      <div className="App-View">
        <div className="App-Container">
          <div className="Container">
            <div className="unlimited-row">
              <div className="fixed-col">
                <div className="col-header">
                  <h3>Attributes</h3>
                  <span className="mx-1"> | </span>
                  <small>most noted</small>
                </div>
                <div className="col-content col-attr">
                  <div className="grid" data-masonry='{ "itemSelector": ".grid-item", "columnWidth": 200 }'>
                    {this.state.attribute_list.sort((a, b) => b.nunique - a.nunique).map((item, key) => {
                      return <AttrItem
                                key={key}
                                is_selected = {this.state.selected_attrs.has(item.lemma) ? true : false}
                                onclickfn = {this.getByLemma}
                                name = {item.lemma}
                                item=<span>
                                        <span className="badge badge-light font-weight-normal">{item.count}</span>
                                        <span className="text-white">/</span>
                                        <span className="badge badge-light font-weight-normal">{item.nunique}</span>
                                        <span> {item.lemma}</span>
                                     </span>
                                deleteItem={this.deleteItem.bind(this, key)}
                            />
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className="fixed-col">
                <div className="col-header">
                  <h3>Visualization</h3>
                  </div>
                  <div id="graph">
                    {<App
                        state = {this.createGraphComponents()}
                      />}
                </div>
              </div>
              <div className="fixed-col">
                <div className="col-header">
                  <h3>Reviews</h3>
                  <span className="mx-1"> | </span>
                  <small>to put attributes into context</small>
                </div>
                <div className="col-content">
                  <div className="grid" data-masonry='{ "itemSelector": ".grid-item", "columnWidth": 200 }'>
                    {this.state.filtered_reviews.map((item, key) => {
                      return <ReviewItem
                                key={key}
                                opinion={item.opinion}
                                item=<span>
                                        <span className={"badge badge-"+(item.opinion==='con' ? 'danger' : 'success')}>{item.opinion}</span>
                                        <span> {item.text}</span>
                                     </span>
                            />
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className="fixed-col">
                <div className="col-header">
                  <h3>Products</h3>
                  <span className="mx-1"> | </span>
                  <small>with all selected attributes</small>
                </div>
                <div className="col-content">
                  <div className="grid" data-masonry='{ "itemSelector": ".grid-item", "columnWidth": 200 }'>
                    {this.state.filtered_posts.map((item, key) => {
                      return <PostItem
                                key={key}
                                discussion_url={item.discussion_url}
                                tagline={item.tagline}
                                item=<span>
                                        <span> {item.name}</span>
                                     </span>
                            />
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="Page-Control px-3 py-1">
          <div className="row">
            <div className="col-sm-4">
              <h1>Product Scent
                <a href="https://www.producthunt.com" target="#"><img className="Logo" src={Logo} alt="ProductHunt logo"/></a>
              </h1>
            </div>
            <div className="col-sm-4">
              <div id="text-carousel" className="carousel slide" data-ride="carousel">
              <ol className="carousel-indicators mb-1">
                <li data-target="#text-carousel" data-slide-to="0" className="active"></li>
                <li data-target="#text-carousel" data-slide-to="1"></li>
                <li data-target="#text-carousel" data-slide-to="2"></li>
              </ol>
                <div className="carousel-inner text-light">
                  <div className="carousel-item text-center pt-2 active">
                    <p> Get insights on how people value products </p>
                  </div>
                  <div className="carousel-item text-center pt-2">
                    <p> Find inspiration to do things better </p>
                  </div>
                  <div className="carousel-item text-center pt-2">
                    <p> Powered by Human Intelligence, empowered by Artificial Intelligence </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <button className="btn btn-warning" onClick={() => this.testing()}>from @ Code-Omega</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainView;
