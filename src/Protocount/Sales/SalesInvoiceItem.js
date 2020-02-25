import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import PrintPreviewLayoutOne from '../Shared/PrintPreviewLayoutOne'
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';



function SalesInvoiceItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectStock,error:errorSelectStock}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'stock'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectGLCode,error:errorSelectGLCode}]=useFetch({
        url:'./getEligibleGLAccount',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'sales_invoice'}),
            credentials:'include'
        }
    });//extension of Item component

    const [debtorList,changeDebtorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','','']) 
    /*8 initial core inputState array elements. Amend the number if additional input added in future. Invoiceline input elements are 
    added at end of inputState array*/
    const [initialNumberInputState]=useState(8);
    const [printPreview,changePrintPreview]=useState(false);
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{
        
        if (dataSelectDebtor && dataSelectDebtor.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectDebtor && dataSelectDebtor.data && dataSelectDebtor.field) 
            changeDebtorList(dataSelectDebtor.data.map(data=>(
            <option key={data[dataSelectDebtor.field[0].name]} value={data[dataSelectDebtor.field[0].name]}>
                {data[dataSelectDebtor.field[0].name]+' | '+(data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'')}
            </option>)
            )
        )

        if (dataSelectStock && dataSelectStock.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectStock && dataSelectStock.data && dataSelectStock.field) 
            changeStockList(dataSelectStock.data.map(data=>(
            <option key={data[dataSelectStock.field[0].name]} value={data[dataSelectStock.field[0].name]}>
                {data[dataSelectStock.field[0].name]+' | '
                + (data[dataSelectStock.field[1].name]?data[dataSelectStock.field[1].name]:'')+' | '
                + (data[dataSelectStock.field[2].name]?data[dataSelectStock.field[2].name]:'')}
            </option>)
            )
        )

        if (dataSelectGLCode && dataSelectGLCode.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectGLCode && dataSelectGLCode.data && dataSelectGLCode.field) 
            changeGLCodeList(dataSelectGLCode.data.map(data=>(
            <option key={data[dataSelectGLCode.field[0].name]} value={data[dataSelectGLCode.field[0].name]}>
                {(data[dataSelectGLCode.field[0].name]?data[dataSelectGLCode.field[0].name]:'')
                +' | '+(data[dataSelectGLCode.field[1].name]?data[dataSelectGLCode.field[1].name]:'')}
            </option>)
            )
        )

    },[dataSelectDebtor,errorSelectDebtor,dataSelectStock,errorSelectStock,dataSelectGLCode,errorSelectGLCode])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }
    function onChangeInvoicelineInput(e,order,innerOrder) {
        changeInputState([...inputState.slice(0,order),inputState.slice(order,order+1)[0].slice(0,innerOrder).concat(e.target.value)
        .concat(inputState.slice(order,order+1)[0].slice(innerOrder+1,inputState.slice(order,order+1)[0].length)),
        ...inputState.slice(order+1)])
    }
    function calculateSubtotal(i) {
        if (inputState[i+initialNumberInputState][3]!=='' && inputState[i+initialNumberInputState][4]!=='' && inputState[i+initialNumberInputState][5]!=='')
            return ((parseFloat(inputState[i+initialNumberInputState][3])*parseFloat(inputState[i+initialNumberInputState][4]))-parseFloat(inputState[i+initialNumberInputState][5])).toFixed(2)
        else return '';
    }

    function calculateTotal() {
        let total=0
        inputState.slice(initialNumberInputState,inputState.length).forEach((invoicelineSet,i)=>{

            if(inputState[i+initialNumberInputState][3]!=='' && inputState[i+initialNumberInputState][4]!=='' && inputState[i+initialNumberInputState][5]!=='')
             total=total+((parseFloat(inputState[i+initialNumberInputState][3])*parseFloat(inputState[i+initialNumberInputState][4]))-parseFloat(inputState[i+initialNumberInputState][5]))
        })
        return total.toFixed(2);
    }
    
    function invoicelineListRender(disabled) {
    return(
        inputState.slice(initialNumberInputState).map((invoicelineSet,i)=>
        <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
            {/*set fixed flex basis so layout is consistent with h6 header as well*/}
            <label htmlFor='lineNumber' className='sr-only'/>
            <input type='number' id='lineNumber' className='col form-control rounded-0 text-center' value={inputState[i+initialNumberInputState][0]} 
            onChange={(e)=>e} style={{flex:'1 0 90px',paddingLeft:0,paddingRight:0}} disabled={disabled}/>
            <div className='col input-group' style={{flex:'1 0 90px',paddingLeft:0,paddingRight:0}}>
                <label htmlFor='itemCode' className='sr-only'/>
                <input type='text' id ='itemCode' className='form-control rounded-0' disabled={disabled}
                value={inputState[i+initialNumberInputState][1]?inputState[i+initialNumberInputState][1]:''} onChange={(e)=>onChangeInvoicelineInput(e,i+initialNumberInputState,1)}/>
                <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                        let stockDescription='';
                        let stockPrice='';
                        dataSelectStock.data.forEach(data=>{
                            
                            if(data[dataSelectStock.field[0].name]===e.target.value) {
                                stockDescription=data[dataSelectStock.field[1].name]?data[dataSelectStock.field[1].name]:'';
                                stockPrice=data[dataSelectStock.field[2].name]?data[dataSelectStock.field[2].name]:'';
                            }
                        })
        
                        changeInputState([...inputState.slice(0,i+initialNumberInputState),[i+1].concat([e.target.value]).concat(stockDescription)
                        .concat(stockPrice).concat(inputState.slice(i+initialNumberInputState,i+initialNumberInputState+1)[0]
                        .slice(4,inputState.slice(i+initialNumberInputState,i+initialNumberInputState+1)[0].length)),
                        ...inputState.slice(i+initialNumberInputState+1,inputState.length)])
                        }}>
                    <option value=''>-select an option- </option>
                    {stockList}
                </select>
            </div>
            <label htmlFor='description' className='sr-only'/>
            <input type='text' id='description' required className='col form-control rounded-0' value={inputState[i+initialNumberInputState][2]} 
            onChange={(e)=>onChangeInvoicelineInput(e,i+initialNumberInputState,2)} disabled={disabled}
            style={{flex:'1 0 135px',paddingLeft:0,paddingRight:0}}/>

            <label htmlFor='price' className='sr-only'/>
            <input type='number' required min='0' step='.01' id='price' className='col form-control rounded-0 text-center' value={inputState[i+initialNumberInputState][3]} 
            onChange={(e)=>onChangeInvoicelineInput(e,i+initialNumberInputState,3)} disabled={disabled}
            style={{flex:'1 0 75px',paddingLeft:0,paddingRight:0}}/>

            <label htmlFor='qty' className='sr-only'/>
            <input type='number' required min='0' step='1' id='qty' className='col form-control rounded-0 text-center' value={inputState[i+initialNumberInputState][4]} 
            onChange={(e)=>onChangeInvoicelineInput(e,i+initialNumberInputState,4)} disabled={disabled}
            style={{flex:'1 0 75px',paddingLeft:0,paddingRight:0}}/>

            <label htmlFor='discount' className='sr-only'/>
            <input type='number' required min='0' step='.01' id='discount' className='col form-control rounded-0 text-center' value={inputState[i+initialNumberInputState][5]} 
            onChange={(e)=>onChangeInvoicelineInput(e,i+initialNumberInputState,5)} disabled={disabled}
            style={{flex:'1 0 75px',paddingLeft:0,paddingRight:0}}/>

            <label htmlFor='subtotal' className='sr-only'/>
            <input type='number' step='.01' disabled id='subtotal' className='col form-control rounded-0 text-right' 
            value={calculateSubtotal(i)} 
            style={{flex:'1 0 90px',paddingLeft:0,paddingRight:0}}/>
        </div>)
        )
    }
    
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock ||
    (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}

            {dataSelectStock && dataSelectStock.error? 'Stock List RETRIEVAL for item failed errno: '+dataSelectStock.error.errno
            +' code: '+dataSelectStock.error.code+' message: '+dataSelectStock.error.sqlMessage:null}
            {errorSelectStock? 'Stock List RETRIEVAL for item failed '+errorSelectStock : null}

            {dataSelectGLCode && dataSelectGLCode.error? 'GL Code List RETRIEVAL for item failed errno: '+dataSelectGLCode.error.errno
            +' code: '+dataSelectGLCode.error.code+' message: '+dataSelectGLCode.error.sqlMessage:null}
            {errorSelectGLCode? 'GL Code List RETRIEVAL for item failed '+errorSelectGLCode : null}
        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='sales_invoice' successPath='/SalesInvoice'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> printPreview? (
            <PrintPreviewLayoutOne description={SalesInvoiceItem.description} 
                changePrintPreview={changePrintPreview}
                printPreview={printPreview}
                topLeftInput={[inputState[1],inputState[2]]}
                topRightField={[SalesInvoiceItem.description+' No','Date','Other Description']}
                topRightInput={[inputState[3],inputState[4],inputState[5]]}
                bottomField={['','Item Code','Description','Price','Qty','Discount','Subtotal']}
                bottomInput={inputState.slice(initialNumberInputState)}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
                footer='NET 30 Days. Finance Charge of 1.5% will be made on unpaid balances after 30 days.'
            />)
            :
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ SalesInvoiceItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='row'>
                            <fieldset className='form-group form-row col-md-5 mx-3 border border-secondary pb-4 rounded' disabled={disabled}>
                                <legend className='col-form-label col-4 offset-4 text-center' ><h6>Debtor <span className='text-warning'>*</span></h6></legend>
                                <label className='mt-3' htmlFor='debtorID' >Debtor ID</label>
                                <div className='input-group'>
                                    {/*if input is disabled, browser does not validate entry (and hence problem if option from dropdown 
                                    not chosen).Hence to prevent user altering input content(other than using those in dropdown) AND 
                                    to ensure a value is chosen set required attribute and a onChange event handler that does nothing*/}
                                    <input type='text' id='debtorID' value={inputState[0]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                        let debtorName='';
                                        let debtorAddress='';
                                    
                                        dataSelectDebtor.data.forEach(data=>{
                                            
                                            if(data[dataSelectDebtor.field[0].name]===e.target.value) {
                                                debtorName=data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'';
                                                debtorAddress=data[dataSelectDebtor.field[2].name]?data[dataSelectDebtor.field[2].name]:'';
                                            }
                                            
                                        })
                                    
                                    changeInputState([e.target.value,debtorName,debtorAddress,...inputState.slice(3,inputState.length)])
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {debtorList}
                                    </select>
                                </div>
                                <label className='mt-3' htmlFor='debtorName'>Debtor Name</label>
                                <input id='debtorName' value={inputState[1]} onChange={(e)=>e} required className='form-control'/>
                                <label className='mt-3' htmlFor='debtorAddress'>Debtor Address</label>
                                <textarea id='debtorAddress' value={inputState[2]} onChange={(e)=>e} required className='form-control'/>
                                
                            </fieldset>

                            <div className='form-group col-md-5 mx-3'>
                                <label htmlFor='invoiceNumber' className='mt-3'>Invoice Number <span className='text-warning'>*</span></label>
                                {inputNumberRender({
                                    onChange:onChange,
                                    layout:'',
                                    position:3,
                                    labelID:'invoiceNumber'
                                })
                                }
                                
                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[4]} onChange={(e)=>onChange(e.target.value,4)} 
                                className='form-control'/>
                                
                                <label className='mt-3' htmlFor='glCode' >GL Code <span className='text-warning'>*</span></label>
                                <div className='input-group'>
                                    <input type='text' id='glCode' value={inputState[6]} onChange={(e)=>e} required className='form-control' 
                                    disabled={disabled}/>
                                    <select className='form-control' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                                    onChange(e.target.value,6)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLCodeList}
                                    </select>
                                </div>
                                <label htmlFor='description' className='mt-3'>Description</label>
                                <textarea id='description' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                                
                            </div>

                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-8 offset-2 col-md-4 offset-md-4 text-center' >
                                    <button type='button' className='btn btn-primary' disabled={disabled}
                                    onClick={()=>changeInputState([...inputState,[inputState.length-initialNumberInputState+1,'','','','','']])}>
                                        +</button>
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Invoice Line</h6>
                                    <button type='button' className='btn btn-secondary' disabled={disabled}
                                    onClick={()=>changeInputState([
                                        ...inputState.slice(0,initialNumberInputState),
                                        ...inputState.slice(initialNumberInputState,inputState.length-1)
                                    ])
                                    }>-</button>
                                </legend>
                                <div className="overflow-auto">
                                    {/*flex nowrap and overflow auto for mobile view*/}
                                    <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}}>
                                        <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Line Number</h6>
                                        <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Item Code</h6>
                                        <h6 className='col' style={{flex:'1 0 135px',paddingLeft:10,paddingRight:10}}>Description</h6>
                                        <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Price</h6>
                                        <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Qty</h6>
                                        <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Discount</h6>
                                        <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Subtotal</h6>
                                    </div>
                                    {invoicelineListRender(disabled)}
                                    
                                </div>
                                <h5 className='text-right my-3'>
                                    
                                    {'Total: '+calculateTotal()}
                                    </h5>
                                
                            </fieldset>

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled} printPreview={printPreview} changePrintPreview={changePrintPreview}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
SalesInvoiceItem.description='Sales Invoice';
SalesInvoiceItem.path='/SalesInvoiceItem';

export default SalesInvoiceItem;

