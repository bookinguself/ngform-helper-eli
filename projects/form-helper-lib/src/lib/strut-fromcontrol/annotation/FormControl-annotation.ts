/**
 * 
 *  * Copyright 2021 Eray-YL
 *
 * @author: Yilei
 * @description: create the annotation for formcontrol, below is the Decorators,
 * it will easy to use and build the data strut in formgroup or formarray
 * @param
 */
 import "reflect-metadata";
import { FormControlAnnotationData } from "../data/FCAnnotation-data";
import { FormcontrolStrutHelp } from "../FormcontrolStrutHelper";

export function ADD_FORMCONTROL(option:FormControlAnnotationData|any){
    return function(target,key){
        let controlBean=Reflect.getOwnMetadata("key:controlbean", target) ||{};
        let helpOption:any=option;
        if(!option)
        helpOption=FormcontrolStrutHelp.JUST_ADD;
        controlBean[key]=helpOption;
        Reflect.defineMetadata("key:controlbean", controlBean, target);
    }
}