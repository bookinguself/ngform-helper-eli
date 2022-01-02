/**
 *  * Copyright 2021 Eray-YL
 */
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { CumstMethod } from "./data/FCAnnotation-data";

export interface StrutFormControlHelper{
    initForm(object:any,classType?:any):any;
    refreshFormcontrol(object:any,classTyppe:any);
    serializationObject(object:any,parenUUid?:string):any;
    setCustomFN(key:string,validatorCumst:CumstMethod[]);
    findFormGroupByCtrlKey(ctrlKey:string):FormGroup;
    findAllParentByCtrlKey(ctrlKey:string):FormGroup[];
    findDuplicatedValueInFormArray(proName:string,formArray:any,notIncludeEmpty?:boolean):{[key:string]:FormControl};
    findFormControlObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):FormControl;
    findObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):Object;
    getFormGroup():any;
    removeObjectByControlKey(obj:any,conKey:string,removeContrlName?:string,formArray?:FormArray):void;
    removeAllFormControl():void;
    getControlKey();
}