import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import _ from 'lodash';
import * as d3 from "d3";
import './D3FDG.css';

const FORCE = (function(nsp){

const
  width = 600,
  height = 600,
  font_size = 20,
  text_x_off = 0, //radius/2 + 1,
  text_y_off = 0, //font_size + text_x_off,
  color = d3.scaleOrdinal(d3.schemeSet2),

  tooltip = d3.select("body")
    .append("div")
    .attr("class", "tip")
    .text(""),

  initGraph = () => {
    nsp.height = d3.select("#graph").node().getBoundingClientRect().height
  },

  initForce = (nodes, links) => {
    nsp.nodes = nodes;
    nsp.links = links;
    nsp.force = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-50))
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => nsp.fld[d.type]).strength((d) => nsp.fls[d.type]))
      .force("center", d3.forceCenter().x(nsp.width/2).y(nsp.height/2))
      .force("collide", d3.forceCollide((d) => d.radius).iterations([5]))
      .force('r', d3.forceRadial().radius((d) => nsp.frr[d.type]).x(nsp.width/2).y(nsp.height/2).strength((d) => nsp.frs[d.type]));
  },

  // updateForce = (nodes, links) => {
  //   nsp.force = d3.forceSimulation(nodes)
  //     .force("charge", d3.forceManyBody().strength(-10))
  //     .force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(35))
  //     .force("center", d3.forceCenter().x(nsp.width /2).y(nsp.height / 2))
  //     .force("collide", d3.forceCollide((d) => d.radius+2).iterations([5]));
  // },

  enterNode = (selection) => {
    selection.select('circle')
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d.type); })
      .style("stroke", "bisque")
      .style("stroke-width", "0px")
    selection
      .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.text);})
      .on("mousemove", function(){return tooltip.style("top",
          (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden").text("");});


    selection.select('text')
      .attr("fill", "bisque")
      .style("font-size", font_size+"px")
      .attr("x", text_x_off)
      .attr("y", text_y_off)
      .style("font-family", "'Major Mono Display', monospace")
      .style("text-transform", "lowercase")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
    },

  updateNode = (selection) => {
    selection
      .attr("cx", function(d) { return d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)); })
      .attr("cy", function(d) { return d.y = Math.max(d.radius, Math.min(nsp.height - d.radius, d.y)); })
      .attr("transform", (d) => "translate(" + (d.x ? d.x : 0) + "," + (d.y ? d.y : 0) + ")")
      .select('circle')
        .attr("r", function(d) { return d.radius; })
      // .select('text')
      //   .attr("x", function(d) { return (d.x ? Math.min(text_x_off, Math.max(-1*d.name.length*font_size, width - d.x - d.name.length*font_size/2)) : 0); })
      //   .attr("y", function(d) { return (d.y ? Math.min(text_y_off, Math.max(-1*text_y_off, nsp.height - d.y - font_size/3)) : 0); })
  },

  enterLink = (selection) => {
    selection
      .attr("stroke","bisque")
  },

  updateLink = (selection) => {
    selection
      .attr("stroke-width", (d) => nsp.flw[d.type])
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
  },

  updateGraph = (selection) => {
    selection.selectAll('.node')
      .call(updateNode)
    selection.selectAll('.link')
      .call(updateLink);
  },

  toggleNiche = () => {
    const idx = _.map(_.keys(_.pickBy(nsp.nodes, {type:"niche"})), Number);
    idx.forEach((i)=>{
      console.log(i+" "+nsp.nodes[i].radius);
      nsp.nodes[i].radius = (nsp.nodes[i].radius!==0)?0:30;
    });
    nsp.force.force("collide").radius((d) => d.radius)
    nsp.flw['niche'] = (nsp.flw['niche']!==0)?0:10;
  },

  dragStarted = (d) => {
    if (!d3.event.active) nsp.force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y
  },

  dragging = (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y
  },

  dragEnded = (d) => {
    if (!d3.event.active) nsp.force.alphaTarget(0);
      d.fx = null;
      d.fy = null
  },

  drag = () => d3.selectAll('g.node')
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragging)
      .on("end", dragEnded)
  ),

  updateTick = () => {
    nsp.force.alpha(0.3).restart();
  },

  tick = (that) => {
    that.d3Graph = d3.select(ReactDOM.findDOMNode(that));
    nsp.force.on('tick', () => {
      that.d3Graph.call(updateGraph)
    });
  };

  nsp.width = width;
  nsp.height = height;
  nsp.enterNode = enterNode;
  nsp.updateNode = updateNode;
  nsp.enterLink = enterLink;
  nsp.updateLink = updateLink;
  nsp.updateGraph = updateGraph;
  nsp.initGraph = initGraph;
  nsp.initForce = initForce;
  nsp.dragStarted = dragStarted;
  nsp.dragging = dragging;
  nsp.dragEnded = dragEnded;
  nsp.drag = drag;
  nsp.tick = tick;

  nsp.updateTick = updateTick;

  nsp.toggleNiche = toggleNiche;
  nsp.frr = {'post': nsp.width/4, 'review pro': 0, 'review con': nsp.width/2, 'niche': nsp.width/4};
  nsp.frs = {'post': 0.5, 'review pro': 0.1, 'review con': 0.1, 'niche': 0.5};
  nsp.fld = {'review': 30, 'niche': 0};
  nsp.fls = {'review': 0.5, 'niche': 0};
  nsp.flw = {'review': 1, 'niche': 0};

  return nsp

})({})

////////////////////////////////////////////////////////////////////////////
/////// class App is the parent component of Link and Node
////////////////////////////////////////////////////////////////////////////

class App extends Component {

    toggleNiche() {
      FORCE.toggleNiche()
      FORCE.updateTick()
    }

    componentDidMount() {
        const data = this.props.state;
            FORCE.initGraph()
            FORCE.initForce(data.nodes, data.links)
            FORCE.tick(this)
            FORCE.drag()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.state.nodes !== this.props.state.nodes || prevProps.state.links !== this.props.state.links) {
            const data = this.props.state;
                FORCE.initGraph()
                FORCE.initForce(data.nodes, data.links)
                FORCE.tick(this)
                FORCE.drag()
        }
    }

    render() {
        var links = this.props.state.links.map( (link) => {
            return (
                <Link
                    key={link.id}
                    data={link}
                />);
        });
        var nodes = this.props.state.nodes.map( (node) => {
              return (
              <Node
                  data={node}
                  name={node.name}
                  key={node.id}
              />);
          });
        return (
          <div className="graph__container">
            <div className="graph__control card py-1 px-2">
              <span class="btn-group input-group-sm my-1">
                <div class="input-group-prepend">
                  <span class="input-group-text btn-group-tag">Toggle Elements</span>
                </div>
                <button className="btn btn-sm btn-warning" onClick={() => this.toggleNiche()}>Product Niche</button>
                <button className="btn btn-sm btn-secondary disabled" >Pros-Cons</button>
              </span>
              <span class="btn-group input-group-sm my-1">
                <div class="input-group-prepend">
                  <span class="input-group-text btn-group-tag">Organize By</span>
                </div>
                <button className="btn btn-sm btn-warning active" >Pros & Cons</button>
                <button className="btn btn-sm btn-secondary disabled" >Niche</button>
                <button className="btn btn-sm btn-secondary disabled" >Age</button>
              </span>
            </div>
            <svg className="graph" width={FORCE.width} height={FORCE.height}>
                <g>
                    {links}
                </g>
                <g>
                    {nodes}
                </g>
            </svg>
          </div>
        );
    }
}

///////////////////////////////////////////////////////////
/////// Link component
///////////////////////////////////////////////////////////

class Link extends React.Component {

    componentDidMount() {
      this.d3Link = d3.select(ReactDOM.findDOMNode(this))
        .datum(this.props.data)
        .call(FORCE.enterLink);
    }

    componentDidUpdate() {
      this.d3Link.datum(this.props.data)
        .call(FORCE.updateLink);
    }

    render() {
      return (
        <line className='link' />
      );
    }
}

///////////////////////////////////////////////////////////
/////// Node component
///////////////////////////////////////////////////////////

class Node extends React.Component {

    componentDidMount() {
      this.d3Node = d3.select(ReactDOM.findDOMNode(this))
        .datum(this.props.data)
        .call(FORCE.enterNode)
    }

    componentDidUpdate() {
      this.d3Node.datum(this.props.data)
        .call(FORCE.updateNode)
    }

    render() {
      return (
        <g className='node'>
          <circle>
          </circle>
          <text>{this.props.data.name}</text>
        </g>
      );
    }
}

export default App;
