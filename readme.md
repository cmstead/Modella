Modella.js
==========

Modella.js is a data modelling object for JavaScript which is meant to act as an abstraction layer between
a simple ORM like Angular's resources or other wire-call service.  The basic CRUD behaviors default to standard
RESTful post, get, put, delete calls, but some extended methods are included.  Speciallized CRUD calls can be configured
upon object instantiation.

Modella.js is currently in development. Please refer to the list below regarding items that are complete and items
that are still in development:

Modella core

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

Modella abstraction object

- [x] Model instantiation abstraction layer
- [x] Parent-child relationship configuration
- [x] Get parents function
- [x] Get children function
- [ ] Updated clean and copy functions
- [ ] Depth of model construction parameter and management

Documentation

- [ ] Core API documentation
- [ ] Abstraction layer documentation