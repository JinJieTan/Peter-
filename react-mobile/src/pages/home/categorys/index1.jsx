import React ,{Fragment} from  'react'
import loadbel from 'react-loadable'
import Loading from '../../../components/loading'
const LoadComponent = loadbel({
    loader:()=>import('./index.jsx'),
    loading:Loading
})
export default class App extends React.Component{
    render(){
        return(
            <Fragment>
                <LoadComponent></LoadComponent>
            </Fragment>
        )
    }
}