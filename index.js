/*
 * Copyright [Brendan Graetz](http://bguiz.com)
 *
 * [Source](https://github.com/bguiz/xml-json-convert)
 *
 * License: GPL-3.0
 */
'use strict';

var
    NAME_KEY = '__name',
    ATTRIBUTES_KEY = '__attrs',
    TEXT_KEY = '__text',
    XMLSTR_NEWLINE = '\n',
    XMLSTR_INDENT = '  ';

function xml2jsonArray(xmlDoc) {

    // Create the return object
    var obj = [];
    obj[NAME_KEY] = xmlDoc.nodeName;

    // allow loose comparion because sometimes value is '1' instead of 1
    if (xmlDoc.nodeType == 3) {
        // text
        obj[TEXT_KEY] = xmlDoc.nodeValue;
    }
    else if (xmlDoc.nodeType == 1) {
        // do attributes
        obj[ATTRIBUTES_KEY] = {};
        if (xmlDoc.attributes.length > 0) {
            for (var i = 0; i < xmlDoc.attributes.length; ++i) {
                var attr = xmlDoc.attributes.item(i);
                obj[ATTRIBUTES_KEY][attr.nodeName] = attr.nodeValue;
            }
        }
    }

    if (xmlDoc.hasChildNodes()) {
        // recursively, for child nodes
        for (var j = 0; j < xmlDoc.childNodes.length; ++j) {
            var item = xmlDoc.childNodes.item(j);
            var childNode = xml2jsonArray(item);
            obj.push(childNode);
        }
    }
    return obj;
}

function jsonArray2XmlStr(jsonArr, indent) {
    var name = jsonArr[NAME_KEY];
    var attrs = jsonArr[ATTRIBUTES_KEY];
    var text = jsonArr[TEXT_KEY];
    var useIndent, useTagIndent, useChildIndent;
    if (typeof indent === 'undefined') {
        useIndent = '';
        useTagIndent = '';
        useChildIndent = '';
    }
    else {
        useIndent = indent;
        useTagIndent = XMLSTR_NEWLINE+useIndent;
        useChildIndent = indent+XMLSTR_INDENT
    }

    if (name === '#text') {
        return text;
    }
    var openTag;
    var closeTag;
    if (name === '#document') {
        openTag = '';
        closeTag = '';
    }
    else {
        openTag = useTagIndent+'<'+name;
        for (var attrName in attrs) {
            openTag = openTag+' '+attrName+'="'+attrs[attrName]+'"';
        }
        openTag = openTag+'>';
        closeTag = useTagIndent+'</'+name+'>';
    }
    var tagContents = '';
    for (var i = 0; i < jsonArr.length; ++i) {
        // recursively, for child nodes
        var childJsonArr = jsonArr[i];
        tagContents = tagContents + jsonArray2XmlStr(childJsonArr, useChildIndent);
    }
    return openTag+tagContents+closeTag;
}

function xmlStr2JsonArray(xmlStr) {
    var parser = new DOMParser();
    var xml = parser.parseFromString(xmlStr, 'application/xml');
    var jsonArr = xml2jsonArray(xml);
    return jsonArr;
}

function jsonArray2Xml(jsonArr) {
    var xmlStr = jsonArray2XmlStr(jsonArr);
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
    // do not attempt to detect parsererror - there are too many different ways it can happen
    return xmlDoc;
}
