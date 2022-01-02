/**
 * 
 *  * Copyright 2021 Eray-YL
 *
 * @author Yilei
 * @description: this helper will easy to create formcontol by data strut
 * this is a version 1.0, only support same page the form, that mean if different component, want to use
 * same formgroup
 * this service will not help. we will keep to upgrad
 *
 * @howToUse
 * #1 create class for the target form, put the annotation "ADD_FORMCONTROL" to each propertie
 * #2 use new to instant FormcontrolStrutHelp
 * #3 call serializationObject to serializa the class that you created just now
 * #4 call initFormcontrol init the formgroup or formarry, the type follow the class type, if object it will retun formgroup, if array it will return fomrarray
 *
 * @example
 * #1 new someclass(),
 * add annotation "@ADD_FORMCONTROL({"vFormatFns":[],"validation":{....}})"
 * #2 new FormcontrolStrutHelp()
 * #3
 * this.formcontrolStrutHelp.serializationObject(someclass);
    this.formcontrolStrutHelp.initFormcontrol(someclass);
    this.stormWarningDataForm = this.formcontrolStrutHelp.getFormGroup();
    this.stormWarningDataForm.markAllAsTouched();


 * @important dont forget to update the version recode when did the changed in this file
 *
 * ---date----------version-------------author-------------------target----------------------
 * 2021-10-16       1.0                 Yilei                   init
 * 2021-10-19       1.1                 Jiayi                   type -> classType
 * 2021-10-24       1.2                 Yilei                   add finding method:
 *                                                              findFormGroupByCtrlKey(ctrlKey:string):FormGroup
                                                                findAllParentByCtrlKey(ctrlKey:string):FormGroup[]
                                                                findDuplicatedValueInFormArray(proName:string,formArray:FormArray,notIncludeEmpty?:boolean):{[key:string]:FormControl}
                                                                findFormControlObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):FormControl
                                                                findObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):Object
 *  
*/

import "reflect-metadata";
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { plainToClass } from 'class-transformer';
import { throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {  FormControlAnnotationData, CtrlNname, CumstMethod } from './data/FCAnnotation-data';
import { StrutFormControlHelper } from "./FormControlHelper";

//user new one object, it is easy to control, because it is own fromgroup inside
export class FormcontrolStrutHelp implements StrutFormControlHelper{
    private ownFormGroup:any;
    controlKey:string="CONTROL-KEY";
    static JUST_ADD:string='JUSTADD';
    private fnArray:{[key:string]:CumstMethod[]};
    //add some object if need to call method belong to this object
    private  targetObj:any;
    constructor(private target:any){
        this.targetObj=target;
       this.fnArray={};
    }
    getControlKey() {
        return this.controlKey;
    }
    initForm(object:any,classType?:any):any{
        try
        {
            let obj=object;
            this.serializationObject(object)
            if(classType)
            {
                obj=plainToClass(classType,object);
            }
            this.initFormcontrol(obj);
            return this.ownFormGroup;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }

    }
    /**
     * get the rule from meta data, create the formgroup or formarray
     * @param object
     * @returns
     */
    private initFormcontrol(object:any,arrayOpt?:any):any{
        //let reObject;
       try
       {
                if(object instanceof Array)
                {
                    let formarray=new FormArray([], []);
                    object.forEach(obj=>{
                        if(this.isCustomObj(obj))
                        formarray.push(this.initFormcontrol(obj));
                        else
                            if(arrayOpt)
                            {
                                let controlObj:FormControlAnnotationData=arrayOpt as FormControlAnnotationData;
                                formarray.push(new FormControl(obj,this.getValidators(controlObj.validation,obj[this.controlKey])))
                            }
                            else
                            {
                                formarray.push(new FormControl(obj,{}))
                            }
                    });
                    this.ownFormGroup=formarray;
                    return formarray;
                }
                else
                {
                    if(object[this.controlKey])
                    {
                        let controlObjs=Reflect.getMetadata("key:controlbean",object);
                        if(!controlObjs)
                        {
                        console.error("Can not find any metadata from this class");
                        throw new Error("Can not find any metadata from this class");
                        }
                        let childFormGroup:FormGroup=new FormGroup({});
                        //add the controlkey for UniqueId , the key will be the json key name from object
                        for(let key in object)
                        {
                            if(object[key] instanceof Array){
                                //if array, will put to formgroup, proccess the array again in the same time
                                if(controlObjs&&controlObjs[key])
                                {
                                    let newArray=object[key];
                                    if(typeof(controlObjs[key])=='function' )
                                    {
                                        
                                        //if array, will put to formgroup, proccess the array again in the same time
                                        let as=object[key] as Array<any>;
                                       newArray=[];
                                        as.forEach(em=>{
                                            let source=plainToClass(controlObjs[key](), em);         
                                        newArray.push(source);
                                        })
                                        
                                    }
                                    childFormGroup.addControl(key,this.initFormcontrol(newArray,controlObjs[key]));
                                }
                               
                            
                            }
                            else
                            {
                                if(controlObjs&&controlObjs[key])
                                {
                                    //let check=new FormControlAnnotationData();
                                    if(typeof(controlObjs[key])=='function' )
                                    {
                                        if(this.isCustomObj(object[key] ))
                                        {
                                            let sourceData=object[key];
                                            let source=plainToClass(controlObjs[key](), sourceData);                                   
                                            childFormGroup.addControl(key,this.initFormcontrol(source));
                                        }
                                    }
                                    // if(controlObjs[key] ==FormcontrolStrutHelp.JUST_ADD)
                                    // {
                                        
                                    
                                    // }
                                    else
                                    {
                                            let controlObj:FormControlAnnotationData=controlObjs[key] as FormControlAnnotationData;
                                            let vfuns=controlObj.vFormatFns;
                                            let v:any=object[key];
                                            if(vfuns.length>0)
                                            {
                                                //call the format function
                                                
                                                vfuns.forEach(vkey=>{
                                                    if(this.fnArray[vkey])
                                                    {
                                                        let custms:CumstMethod[]=this.fnArray[vkey];
                                                        custms.forEach(cutm=>{
                                                            let b=cutm.bindObject?cutm.bindObject:this.targetObj;
                                                            if(cutm.params)
                                                            {
                                                                v=cutm.fn.apply(b,[v,cutm.params]);
                                                            }
                                                            else
                                                                v=cutm.fn.apply(b,[v]);
                            
                                                        })
                                                    }
                                                    else{
                            
                                                    }
                                                })
                                             
                                            }
                                            let keyNname={} as CtrlNname;
                                            keyNname.ctrlKey=object[this.controlKey];
                                            keyNname.fieldName=key;
                                            childFormGroup.addControl(key,new FormControl(v,this.getValidators(controlObj.validation,keyNname)));
                                    }
                                
                                }
                            }

                        }
                        childFormGroup.addControl(this.controlKey,new FormControl(object[this.controlKey],[]));
                        this.ownFormGroup=childFormGroup;
                    // return childFormGroup;
                    return this.ownFormGroup;
                    }
                    else{
                        throwError (new Error("No correct object, please do serializationObjct for generate controlKey"));
                    }
                }
       }
       catch(e)
       {
            console.error(e)
            throw new Error(e);
       }


    }

    /**
     * descript: rebuild the formcontrol for object, if the object is updated
     * call this method will recreate the formcntrol by the new object (some time we delete or add new in the object).
     *
     * @param object
     */

    refreshFormcontrol(object:any,classTyppe:any)
    {
        this.removeAllFormControl();
        this.serializationObject(object);
        let newObj=plainToClass(classTyppe,object);
        this.initFormcontrol(newObj);
        return this.ownFormGroup;
    }

    /**
     * @important: dont forget to call this method, it will create the the control key
     * @description for object is list, add the uuid to the object
     * @param {*} object
     * @returns {*}
     * @memberof FormControlCreateHelper
     */
    serializationObject(object:any,parenUUid?:string):any{
       try
       {
            let reObject;
            if(object instanceof Array)
            {
                reObject=[];
            object.forEach(o=>{
                if(this.isCustomObj(o))
                {
                    if(parenUUid)
                    {
                        reObject.push(this.serializationObject(o,parenUUid));
                    }
                    else
                    {
                        reObject.push(this.serializationObject(o));
                    }
                }
                else
                reObject.push(o);
            });
            }
            else
            {
                reObject=object||{};
                let tempkey=uuidv4();
                //add the parent key to the child key, let the child easy to search the parent
                if(parenUUid)
                {
                    tempkey=parenUUid+"_"+tempkey;
                }
                for(let okey in reObject){
                    if(reObject[okey] instanceof Array){
                        if(this.isCustomObj(reObject[okey]))
                        this.serializationObject(reObject[okey],tempkey);
                    }
                    else if(this.isCustomObj(reObject[okey] ))
                    {
                        this.serializationObject(reObject[okey],tempkey);
                    }
                }
                
                reObject[this.controlKey]=tempkey;
            }
            return reObject;
       }
       catch(e)
       {
            console.error(e);
            throw new Error(e);
       }
    }

    setCustomFN(key:string,validatorCumst:CumstMethod[])
    {
        this.fnArray[key]=validatorCumst;
    }

    /**
     * @description find object by Unique control key, it will return FormGroup
     * @param ctrlKey 
     * @returns 
     */
    findFormGroupByCtrlKey(ctrlKey:string):FormGroup
    {
        return this.findFormGroupByCtrlKeySuport(ctrlKey, this.ownFormGroup);
    }

    /**
     * @description help find formgroup by ctrlkey method, method suport N level object parse 
     * @param ctrlKey Unique control key
     * @param obj it will be ownGormgroup, it can be a formgroup or formarray
     * @returns 
     */
    private findFormGroupByCtrlKeySuport(ctrlKey:string,obj:any):FormGroup
    {
        try
        {
            //declare the return value
            let reObject:any;
            if(obj instanceof FormArray)
            {
                obj.controls.forEach(o=>{
                    if(o instanceof FormGroup)
                    {
                        //call again method for looping object
                        reObject=this.findFormGroupByCtrlKeySuport(ctrlKey, o);
                    }
                })
            }
            else if(obj instanceof FormGroup)
            {
                //check if the control key, if they tally, will return back
                if(obj.controls[this.controlKey]&&obj.controls[this.controlKey].value==ctrlKey)
                {
                    return obj;
                }
                else
                {
                    //looping the object to check inside got formgroup or formarray or not
                    for(let ownFGkey in obj.controls)
                    {
                        let subFG=obj.controls[ownFGkey];
                            if(subFG instanceof FormGroup || subFG instanceof FormArray)
                            {
                                if(subFG instanceof FormGroup&&subFG.controls[this.controlKey]&&subFG.controls[this.controlKey].value==ctrlKey)
                                {
                                    return subFG;
                                }
                                else
                                {
                                    //if it is formgroup or formarray, will let it looping again
                                    reObject=this.findFormGroupByCtrlKeySuport(ctrlKey,subFG);
                                }
                            }
                        
                    }
                }
            }
            return reObject;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
    
    }

    /**
     * @description will looking for all the parent for ctrlKey giving by paramter
     * @param ctrlKey Unique control key
     * @returns a groupform list will return, it will include all the parent and itself, the parent will sort by order inside the list
     * for example: [parent1, parent2....,itself]
     */
    findAllParentByCtrlKey(ctrlKey:string):FormGroup[]
    {
       try
       {
            let returnValue=[];
            let parentArray=ctrlKey.split("_");
            let keyTemp="";
            parentArray.forEach(key=>{
                if(keyTemp!="")keyTemp+="_";            
                keyTemp+=key;
                returnValue.push(this.findFormGroupByCtrlKey(keyTemp));
            })
            return returnValue;
       }
       catch(e)
       {
           console.error(e)
           throw new Error(e);
       }
    }

    /**
     * 
     * @param proName property name in class
     * @param formArray the target fromarray, checking the duplicated inside
     * @param includeEmpty Optional, if set to true, it will not include the empty one
     * @returns The object will use control-key for the object key, value is the duplicated formcontrol object, so the user can do the set error.....
     */
    findDuplicatedValueInFormArray(proName:string,formArray:any,notIncludeEmpty?:boolean):{[key:string]:FormControl}
    {
        try
        {
            let formControls:{[key:string]:FormControl}={};
            formArray.controls.forEach((fgroup:FormGroup)=>{
                let compName=fgroup.get(proName).value;
                formArray.controls.filter((childGrop:FormGroup)=>{
                    let childName=childGrop.get(proName).value;
                    if(fgroup.get(this.controlKey).value!=childGrop.get(this.controlKey).value&&compName==childName)
                    {
                        if(notIncludeEmpty&&notIncludeEmpty==true)
                        {
                            if(childName!=""&&compName!="")
                            {
                                formControls[fgroup.get(this.controlKey).value]=fgroup.get(proName) as FormControl;
                                formControls[childGrop.get(this.controlKey).value]=childGrop.get(proName) as FormControl;
                            }
                        }
                        else
                        {
                            formControls[fgroup.get(this.controlKey).value]=fgroup.get(proName) as FormControl;
                            formControls[childGrop.get(this.controlKey).value]=childGrop.get(proName) as FormControl;
                        }
        
                    }
                
                   
                });
            })
            
            return formControls;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
    }

    /**
     * 
     * @param ctrlKey Unique control key
     * @param proName property in side the bean class
     * @param formControlObj form control object, FormGroup or FormArray
     * @returns only support FormControl Return, that mean the property only FormControl, not support FormGroup or FormArray return.
     */
    findFormControlObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):FormControl{
        try
        {
            let retValue:FormControl;
            let formgroup:FormGroup=this.findFormGroupByCtrlKeySuport(ctrlKey,formControlObj);
            if(formgroup.controls[proName] instanceof FormControl)
            retValue=formgroup.controls[proName] as FormControl;
            return retValue;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
       
    }

     /**
     * 
     * @param ctrlKey Unique control key
     * @param proName property in side the bean class
     * @param formControlObj form control object, FormGroup or FormArray
     * @returns return any type, include formgroup, formarray, formcontrol......
     */
      findObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):Object{
        try
        {
            let retValue:Object;
            let formgroup:FormGroup=this.findFormGroupByCtrlKeySuport(ctrlKey,formControlObj);
            retValue=formgroup.controls[proName];
            return retValue;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
        
    }



    /**
     *
     *
     * @private
     * @param {ValidatorHelper} valid
     * @returns {any[]}
     * @memberof FormControlCreateHelper
     */
    private getValidators(valid:{},ctrlNname:CtrlNname):any[]{
        try
        {
            let validArray=[];
            for(let key in valid){
                if(valid[key]&&valid[key]!=null)
                switch(key.toLocaleLowerCase()){
                    case 'min':
                        validArray.push(Validators.min(valid[key]));
                    break;
                    case 'max':
                        validArray.push(Validators.max(valid[key]));
                        break;
                    case 'required':
                        if(valid[key])
                        validArray.push(Validators.required);
                        break;
                    case 'requiredtrue':
                        if(valid[key])
                        validArray.push(Validators.requiredTrue);
                        break;
                    case 'email':
                        if(valid[key])
                        validArray.push(Validators.email);
                        break;
                    case 'minlength':
                        validArray.push(Validators.minLength(valid[key]));
                        break;
                    case 'maxlength':
                        validArray.push(Validators.maxLength(valid[key]));
                        break;
                    case 'pattern'://string pattern need to remove start '/' and end '/'
                        validArray.push(Validators.pattern(valid[key]));
                        break;
                    case 'nullvalidator'://nee to check how to use
                        validArray.push(Validators.nullValidator);
                        break;
                    case 'customvalidator':
                        // let ary=valid[key] as CustomFn[];
                        // ary.forEach(obj=>{
                        //     let fun:any=null;
                        //     if(obj.params.length>0)
                        //     {
                        //         fun=obj.fn(obj.params,this.ownFormGroup,contKey);
                        //     }
                        //     else{
                        //         fun=obj.fn(this.ownFormGroup,contKey);
                        //     }
                        //     if(obj.ctrlKey&&obj.ctrlKey.length>0)
                        //     {
                        //         validArray.push(fun.bind(this.target,obj.ctrlKey));
                        //     }
                        //     else
                        //     {
                        //         validArray.push(fun.bind(this.target));
                        //     }
    
                        // });
                        let ary=valid[key] as string[];
                        ary.forEach(obj=>{
                            if(this.fnArray[obj])
                            {
                                let custms:CumstMethod[]=this.fnArray[obj];
                                custms.forEach(cutm=>{
                                    let b=cutm.bindObject?cutm.bindObject:this.targetObj;
                                    if(cutm.params)
                                    {
                                        validArray.push(cutm.fn.bind(b,ctrlNname,cutm.params));
                                    }
                                    else
                                     validArray.push(cutm.fn.bind(b,ctrlNname));
    
                                })
                            }
                            else{
    
                            }
                        })
                        break;
                }
    
            }
            return validArray;
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
    }

    /**
     *
     *
     * @private
     * @param {*} value
     * @returns
     * @memberof FormcontrolCreaterHelp
     */
    private isCustomObj(value:any):boolean
    {
        let isCus:boolean=true;
        if(typeof value === "string"||typeof value === "number"||typeof value === "boolean")
        {
            isCus=false;
        }
        return isCus;
    }
    /**
     *
     *
     * @returns {FormGroup}
     * @memberof FormcontrolCreaterHelp
     */
    getFormGroup():any
    {
        return this.ownFormGroup;
    }

    /**
     * @ below url is explaination for this method how to remove object from formcontrol
     * @ https://stackoverflow.com/questions/46707026/typescript-formgroup-formarray-remove-only-one-element-object-by-value-angul
     * @param {string} conKey
     * @memberof FormcontrolCreaterHelp
     */
    removeObjectByControlKey(obj:any,conKey:string,removeContrlName?:string,formArray?:FormArray):void
    {
        try
        {
            if(obj instanceof FormArray)
            {
                obj as FormArray;
                for (let control of obj.controls)
                {
                    this.removeObjectByControlKey(control,conKey,removeContrlName,obj);
                }
            }
            else if(obj instanceof FormGroup)
            {
                //console.dir(removeContrlName);
                obj as FormGroup;
                let tempKey=obj.controls[this.controlKey].value;
                if(tempKey===conKey)
                {
                    if(removeContrlName)
                    {
                        obj.removeControl(removeContrlName);
                    }
                    else if(formArray)
                    {
                        formArray.removeAt(formArray.value.findIndex(a=>a[this.controlKey]===conKey))
                    }
                    else
                    {
                        for(let key in obj.controls)
                        {
                            obj.removeControl(key);
                        }
                    }
                }
                else
                {
                    for(let key in obj.controls)
                    {
    
                        if(obj.get(key) instanceof FormArray||obj.get(key) instanceof FormGroup)
                        {
                            this.removeObjectByControlKey(obj.get(key),conKey,removeContrlName,formArray);
                        }
                    }
                }
    
            }
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
       
    }

    /**
     * @author: Yilei
     *
     * @memberof FormcontrolCreaterHelp
     */
    public removeAllFormControl():void{

        try
        {
            this.removeAllFormControlPrivate(this.ownFormGroup);
            if(this.ownFormGroup instanceof FormArray)
            {
                this.ownFormGroup as FormArray;
                for(let i=0;i<this.ownFormGroup.controls.length;i++)
                {
                    this.ownFormGroup.removeAt(i);
                }
            }
            else if(this.ownFormGroup instanceof FormGroup)
            {
                this.ownFormGroup as FormGroup;
                for (let key in this.ownFormGroup.controls)
                {
                    console.dir("removing key: "+key);
                    this.ownFormGroup.removeControl(key);
                }
            }
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
      
    }

    private removeAllFormControlPrivate(obj:any):void{
        try
        {
            if(obj instanceof FormArray)
            {
                obj as FormArray;
                for (let control of obj.controls)
                {
                    this.removeAllFormControlPrivate(control);
                }
    
            }
            else if(obj instanceof FormGroup)
            {
                obj as FormGroup;
                for (let key in obj.controls)
                {
                    //console.dir("removing key: "+key);
                    if(obj.controls[key] instanceof FormArray)
                    {
                        this.removeAllFormControlPrivate(obj.controls[key]);
                    }
                    else
                    {
                        obj.removeControl(key);
                    }
    
                }
            }
        }
        catch(e)
        {
            console.error(e);
            throw new Error(e);
        }
       
    }
}

