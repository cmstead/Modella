Modella.js
==========

Modella.js is a data modelling object for JavaScript which is meant to act as an abstraction layer between
a simple ORM like Angular's resources or other network request service.  The basic CRUD behaviors default to standard
RESTful post, get, put, delete calls, but some extended methods are included.  Specialized CRUD calls can be configured
upon object instantiation.

**Important Stuff To Know**

- Documentation is available at the [Modella wiki](https://github.com/cmstead/Modella/wiki).
- Modella is minified using Uglify. Most options which would interfere with older browsers have been turned off.
- Modella is being released under the [Artistic License 2.0](http://opensource.org/licenses/Artistic-2.0).
- Modella is released AS IS with no guarantee of suitability for any purpose whatsoever. (Please see license documentation)

Wishlist and Chores
===================

**Modella core**

- [x] Basic object instantiation
- [x] Model initialization with a pre-built object
- [x] Model initialization with a record id
- [x] Model initialization with a parent record id
- [x] Model initialization with an array of record ids
- [x] Save functionality on initialized model
- [x] Update functionality on initialized model
- [x] Delete functionality on initialized model
- [x] Inheritable object for model configuration
- [x] Model.revise for batch modifying values
- [x] Model.copy for producing a data-only model copy

Future release

- [ ] Save only on dirty

**Modella extension object**

- [x] Model instantiation abstraction layer
- [x] Parent-child relationship configuration
- [x] Get parents function
- [x] Get children function
- [x] Model simple copy to get just the selected layer
- [x] Recursive revise behavior
- [x] Recursive init with deep initial object

Future release

- [ ] Recursive saveAll -- Depends on core feature: only save on dirty
- [ ] Recursive deleteAll
- [ ] Recursive copy behavior

**Modella configuration object**

- [ ] Inheritable base configuration object
- [ ] Configuration export/import for parent/child handling
- [ ] Depth of model construction parameter and management
- [ ] Extend modella.extender init function to lazy load next-level configurations

**Documentation**

- [x] Core API documentation
- [x] Extension layer documentation
- [ ] Configuration layer documentation

**Chores**

- [ ] Pull enclosed functions out of modella extender and into modella extensionUtilities object
- [ ] Wrap all functions lifted out of modella extender in tests
