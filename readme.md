Modella.js
==========

Modella.js is an ORM-like data modelling object for JavaScript which is meant to act as an abstraction layer between
a simple ORM like Angular's resources or other network request service.  The basic CRUD behaviors default to standard
RESTful post, get, put, delete calls, but some extended methods are included.  Speciallized CRUD calls can be configured
upon object instantiation.

For the (currently under development) documentation, please visit the [Modella wiki](https://github.com/cmstead/Modella/wiki).

Modella.js is currently in development. Please refer to the list below regarding items that are complete and items
that are still in development:

Modella core
============

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

Modella extension object
========================

- [x] Model instantiation abstraction layer
- [x] Parent-child relationship configuration
- [x] Get parents function
- [x] Get children function
- [x] Model simple copy to get just the selected layer
- [x] Recursive copy behavior
- [x] Recursive revise behavior

Future release

- [ ] Recursive saveAll
- [ ] Recursive deleteAll

Modella configuration object
============================

- [ ] Inheritable base configuration object
- [ ] Configuration export/import for parent/child handling
- [ ] Depth of model construction parameter and management

Documentation
=============

- [ ] Core API documentation -- underway
- [ ] Extension layer documentation
- [ ] Configuration layer documentation