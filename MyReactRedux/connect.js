import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import propTypes from 'prop-types';
export default function(mapStateToProps, mapDispatchToProps) {
    return function(WrapedComponent) {
        class ProxyComponent extends Component {
            static contextTypes = {
                store: propTypes.object
            }
            constructor(props, context) {
                super(props, context);
                this.store = context.store;
                this.state = mapStateToProps(this.store.getState());
            }
            componentWillMount() {
                this.store.subscribe(() => {
                    this.setState(mapStateToProps(this.store.getState()));
                });
            }
            render() {
                let actions = {};
                if (typeof mapDispatchToProps == 'function') {
                    actions = mapDispatchToProps(this.store.disaptch);
                } else if (typeof mapDispatchToProps == 'object') {
                    actions = bindActionCreators(mapDispatchToProps, this.store.dispatch);
                }
                return <WrapedComponent {...this.state } {...actions }
                />
            }
        }
        return ProxyComponent;
    }
}