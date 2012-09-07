/**
 * Based on https://code.google.com/p/h5o/ by Dominykas Blyžė
 *
 * This code contains an implementation of HTML5 outlining algorithm, as described by WHATWG at [1]
 *
 * The copyright notice at [2] says:
 *    (c) Copyright 2004-2009 Apple Computer, Inc., Mozilla Foundation, and Opera Software ASA.
 *    You are granted a license to use, reproduce and create derivative works of this document.
 *
 * [1] http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outlines
 * [2] http://www.whatwg.org/specs/web-apps/current-work/multipage/index.html
 */

(function(){
var Section=function(startingNode)
{
  this.sections=[];
  this.startingNode = startingNode;
};
Section.prototype={
  heading: false,
    
  append: function(what)
  {
    what.container=this;
    this.sections.push(what);
  },
    
  asHTML: function(createLinks)
  {
    var headingText = _sectionHeadingText(this.heading);
    if (headingText.indexOf('[edit] ') === 0) {
      // Wikipedia hack
      headingText = headingText.substr(7);
    }
    if (createLinks) {
      headingText = '<a href="#'+_generateId(this.startingNode)+'">'
                    + headingText
              + '</a>';
    }
    return headingText + _sectionListAsHTML(this.sections, createLinks);
  }
};

var _sectionListAsHTML = function (sections, createLinks)
{
  var retval = '';
  
  for (var i=0; i < sections.length; i++) {
    if (sections[i].heading.tagName) {
      retval+='<li class="outliner-' + sections[i].heading.tagName.toLowerCase() + '">'+sections[i].asHTML(createLinks)+'</li>';
    } else {
      retval+='<li class="outliner-tagless">'+sections[i].asHTML(createLinks)+'</li>';
    }
  }
  
  return (retval=='' ? retval : '<ol>'+retval+'</ol>');
}

var _sectionHeadingRank = function(section)
{
  var heading = section.heading;
  return isHeading(heading) 
        ? _getHeadingElementRank(heading) 
        : 1; // is this true? TODO: find a reference...
}

var _sectionHeadingText = function(sectionHeading)
{
  if (isHeading(sectionHeading)) {
    if (_getTagName(sectionHeading)=='HGROUP') {
      sectionHeading = sectionHeading.getElementsByTagName('h'+(-_getHeadingElementRank(sectionHeading)))[0];
    }
    // @todo: try to resolve text content from img[alt] or *[title]
    return sectionHeading.textContent || sectionHeading.innerText || "<i>No text content inside "+sectionHeading.nodeName+"</i>";
  }
  return ""+sectionHeading;
}

var _generateId = function(node)
{
  var id=node.getAttribute('id');
  if (id) return id;
  
  do {
    id='h5o-'+(++linkCounter);
  } while (rootDocument.getElementById(id));
  node.setAttribute('id', id);
  return id;
}
  var currentOutlinee, currentSection, stack, linkCounter, rootDocument;
  
  var walk=function (root, enter, exit) {
    var node = root;
    start: while (node) {
      enter(node);
      if (node.firstChild) {
        node = node.firstChild;
        continue start;
      }
      while (node) {
        exit(node);
        if (node.nextSibling) {
          node = node.nextSibling;
          continue start;
        }
        if (node == root)
          node = null;
        else
          node = node.parentNode;
      }
    }
  }
  var enterNode=function(node)
  {
    // If the top of the stack is a heading content element - do nothing
    if (isHeading(_arrayLast(stack))) {
      return;
    }

    // When entering a sectioning content element or a sectioning root element
    if (isSecContent(node) || isSecRoot(node)) {
      // If current outlinee is not null, and the current section has no heading,
      // create an implied heading and let that be the heading for the current section.
      // if (currentOutlinee!=null && !currentSection.heading) {
        /*
          TODO: is this really the way it should be done?
          In my implementation, "implied heading" is always created (section.heading=false by default)
          
          If I DO "create" something else here, the algorithm goes very wrong, as there's a place
          where you have to check whether a "heading exists" - so - does the "implied heading" mean
          there is a heading or not?
        */
      // }
      
      // If current outlinee is not null, push current outlinee onto the stack.
      if (currentOutlinee!=null) {
        stack.push(currentOutlinee);
      }
      
      // Let current outlinee be the element that is being entered.
      currentOutlinee = node;

      // Let current section be a newly created section for the current outlinee element.
      currentSection = new Section(node);

      // Let there be a new outline for the new current outlinee, initialized with just the new current section as the only section in the outline.
      currentOutlinee.outline = {
                    sections: [currentSection],
                    startingNode: node,
                    asHTML: function(createLinks) { return _sectionListAsHTML(this.sections, createLinks); }
                  }
      return;
    }

    // If the current outlinee is null, do nothing
    if (currentOutlinee==null) {
      return;
    }
    
    // When entering a heading content element
    if (isHeading(node)) {
      
      // If the current section has no heading, let the element being entered be the heading for the current section.
      if (!currentSection.heading) {
        currentSection.heading = node;
      
      // Otherwise, if the element being entered has a rank equal to or greater than the heading of the last section of the outline of the current outlinee, 
      } else if (_getHeadingElementRank(node) >= _sectionHeadingRank(_lastSection(currentOutlinee.outline))) {
        
        // create a new section and 
        var newSection=new Section(node);
        
        // append it to the outline of the current outlinee element, so that this new section is the new last section of that outline. 
        currentOutlinee.outline.sections.push(newSection);
        
        // Let current section be that new section. 
        currentSection = newSection;
        
        // Let the element being entered be the new heading for the current section.
        currentSection.heading = node;
        
      // Otherwise, run these substeps:
      } else {
        var abortSubsteps = false;
        
        // 1. Let candidate section be current section.
        var candidateSection = currentSection;

        do {
          // 2. If the element being entered has a rank lower than the rank of the heading of the candidate section, 
          if (_getHeadingElementRank(node) < _sectionHeadingRank(candidateSection)) {
            
            // create a new section,
            var newSection = new Section(node);

            // and append it to candidate section. (This does not change which section is the last section in the outline.)
            candidateSection.append(newSection);
            
            // Let current section be this new section.
            currentSection = newSection;
            
            // Let the element being entered be the new heading for the current section.
            currentSection.heading = node;
            
            // Abort these substeps.
            abortSubsteps = true;
          }
          
          // 3. Let new candidate section be the section that contains candidate section in the outline of current outlinee.
          var newCandidateSection = candidateSection.container;
          
          // 4. Let candidate section be new candidate section.
          candidateSection = newCandidateSection;
          
          // 5. Return to step 2.
        } while (!abortSubsteps);
      }
      
      // Push the element being entered onto the stack. (This causes the algorithm to skip any descendants of the element.)
      stack.push(node);
      return;
    }

    // Do nothing.
  }
  var exitNode=function(node)
  {
    // If the top of the stack is an element, and you are exiting that element
    //        Note: The element being exited is a heading content element.
    //    Pop that element from the stack.
    // If the top of the stack is a heading content element - do nothing
    var stackTop = _arrayLast(stack);
    if (isHeading(stackTop)) {
      if (stackTop == node) {
        stack.pop();
      }
      return;
    }
    
    /************ MODIFICATION OF ORIGINAL ALGORITHM *****************/
    // existing sectioning content or sectioning root
    // this means, currentSection will change (and we won't get back to it)
    if ((isSecContent(node) || isSecRoot(node)) && !currentSection.heading) {
      
      currentSection.heading = '<i>Untitled ' + _getTagName(node) + '</i>';
      
    }
    /************ END MODIFICATION ***********************************/

    // When exiting a sectioning content element, if the stack is not empty
    if (isSecContent(node) && stack.length > 0) {
      
      // Pop the top element from the stack, and let the current outlinee be that element.
      currentOutlinee = stack.pop();
      
      // Let current section be the last section in the outline of the current outlinee element.
      currentSection = _lastSection(currentOutlinee.outline);
      
      // Append the outline of the sectioning content element being exited to the current section. (This does not change which section is the last section in the outline.)
      for (var i = 0; i < node.outline.sections.length; i++) {
        currentSection.append(node.outline.sections[i]);
      }
      return;
    }

    // When exiting a sectioning root element, if the stack is not empty
    if (isSecRoot(node) && stack.length > 0) {
      // Pop the top element from the stack, and let the current outlinee be that element.
      currentOutlinee = stack.pop();
      
      // Let current section be the last section in the outline of the current outlinee element.
      currentSection = _lastSection(currentOutlinee.outline);

      // Finding the deepest child: If current section has no child sections, stop these steps.
      while (currentSection.sections.length > 0) {
        
        // Let current section be the last child section of the current current section.
        currentSection = _lastSection(currentSection);
        
        // Go back to the substep labeled finding the deepest child.
      }
      return;
    }

    // When exiting a sectioning content element or a sectioning root element
    if (isSecContent(node) || isSecRoot(node)) {
      // Let current section be the first section in the outline of the current outlinee element.
      currentSection = currentOutlinee.outline.sections[0];
       
      // Skip to the next step in the overall set of steps. (The walk is over.)
      return;
    }
    
    // If the current outlinee is null, do nothing
    // Do nothing
  }
  // minifiers will love this more than using el.tagName.toUpperCase() directly
  var _getTagName = function(el)
  {
    return el.tagName.toUpperCase(); // upper casing due to http://ejohn.org/blog/nodename-case-sensitivity/
  }

  var _createTagChecker=function(regexString)
  {
    return function(el)
    {
      return isElement(el) && (new RegExp(regexString, "i")).test(_getTagName(el));
    }
  }
  
  var isSecRoot = _createTagChecker('^BLOCKQUOTE|BODY|DETAILS|FIELDSET|FIGURE|TD$'),
    isSecContent= _createTagChecker('^ARTICLE|ASIDE|NAV|SECTION$'),
    isHeading = _createTagChecker('^H[1-6]|HGROUP$'),
    isElement = function(obj) { return obj && obj.tagName; };
  
  /*
  var _implieadHeadings={
    BLOCKQUOTE: 'Untitled quote', 
    BODY: 'Untitled document', 
    DETAILS: 'Untitled details', 
    FIELDSET: 'Untitled fieldset', 
    FIGURE: 'Untitled figure', 
    TD: 'Untitled cell',
    
    ARTICLE: 'Untitled article', 
    ASIDE: 'Untitled sidebar', 
    NAV: 'Untitled navigation', 
    SECTION: 'Untitled section'
  }
  var impliedHeading=function(el)
  {
    return _implieadHeadings[_getTagName(el)];
  }
  */
    
  var _getHeadingElementRank = function(el)
  {
    var elTagName = _getTagName(el);
    if (elTagName=='HGROUP') {
      /* The rank of an hgroup element is the rank of the highest-ranked h1-h6 element descendant of the hgroup element, if there are any such elements, or otherwise the same as for an h1 element (the highest rank). */
      for (var i=1; i <= 6; i++) {
        if (el.getElementsByTagName('H'+i).length > 0)
          return -i;
      }
    } else {
      return -parseInt(elTagName.substr(1));
    }
  };
  
  var _lastSection = function (outlineOrSection)
  {
    return _arrayLast(outlineOrSection.sections);
  }

  var _arrayLast = function (arr)
  {
    return arr[arr.length-1];
  }
    HTML5Outline=function(start)
  {
    linkCounter=0;
    
    // we need a document, to be able to use getElementById - @todo: figure out a better way, if there is one
    rootDocument = start.ownerDocument || window.document; // @todo: how will this work in, say, Rhino, for outlining fragments?
    
    // Let current outlinee be null. (It holds the element whose outline is being created.)
    currentOutlinee=null;
    
    // Let current section be null. (It holds a pointer to a section, so that elements in the DOM can all be associated with a section.)
    currentSection=null;
    
    // Create a stack to hold elements, which is used to handle nesting. Initialize this stack to empty.
    stack=[];

    // As you walk over the DOM in tree order, trigger the first relevant step below for each element as you enter and exit it.
    walk(start, enterNode, exitNode);

    // If the current outlinee is null, then there was no sectioning content element or sectioning root element in the DOM. There is no outline. Abort these steps.
    /*
    if (currentOutlinee != null) {
      Associate any nodes that were not associated with a section in the steps above with current outlinee as their section.

      Associate all nodes with the heading of the section with which they are associated, if any.

      If current outlinee is the body element, then the outline created for that element is the outline of the entire document.
    }
    */
    
    return currentOutlinee != null ? currentOutlinee.outline : null;
  };

})();