NatSpec Format

Solidity contracts can use a special form of comments to provide rich documentation for functions, return variables and more. This special form is named the Ethereum Natural Language Specification Format (NatSpec).

Note

NatSpec was inspired by Doxygen. While it uses Doxygen-style comments and tags, there is no intention to keep strict compatibility with Doxygen. Please carefully examine the supported tags listed below.

This documentation is segmented into developer-focused messages and end-user-facing messages. These messages may be shown to the end user (the human) at the time that they will interact with the contract (i.e. sign a transaction).

It is recommended that Solidity contracts are fully annotated using NatSpec for all public interfaces (everything in the ABI).

NatSpec includes the formatting for comments that the smart contract author will use, and which are understood by the Solidity compiler. Also detailed below is output of the Solidity compiler, which extracts these comments into a machine-readable format.

NatSpec may also include annotations used by third-party tools. These are most likely accomplished via the @custom:<name> tag, and a good use case is analysis and verification tools.
Documentation Example

Documentation is inserted above each contract, interface, library, function, and event using the Doxygen notation format. A public state variable is equivalent to a function for the purposes of NatSpec.

    For Solidity you may choose /// for single or multi-line comments, or /** and ending with */.

    For Vyper, use """ indented to the inner contents with bare comments. See the Vyper documentation.

The following example shows a contract and a function using all available tags.

Note

The Solidity compiler only interprets tags if they are external or public. You are welcome to use similar comments for your internal and private functions, but those will not be parsed.

This may change in the future.

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 < 0.9.0;

/// @title A simulator for trees
/// @author Larry A. Gardner
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.
contract Tree {
    /// @notice Calculate tree age in years, rounded up, for live trees
    /// @dev The Alexandr N. Tetearing algorithm could increase precision
    /// @param rings The number of rings from dendrochronological sample
    /// @return Age in years, rounded up for partial years
    /// @return Name of the tree
    function age(uint256 rings) external virtual pure returns (uint256, string memory) {
        return (rings + 1, "tree");
    }

    /// @notice Returns the amount of leaves the tree has.
    /// @dev Returns only a fixed number.
    function leaves() external virtual pure returns(uint256) {
        return 2;
    }
}

contract Plant {
    function leaves() external virtual pure returns(uint256) {
        return 3;
    }
}

contract KumquatTree is Tree, Plant {
    function age(uint256 rings) external override pure returns (uint256, string memory) {
        return (rings + 2, "Kumquat");
    }

    /// Return the amount of leaves that this specific kind of tree has
    /// @inheritdoc Tree
    function leaves() external override(Tree, Plant) pure returns(uint256) {
        return 3;
    }
}

Tags

All tags are optional. The following table explains the purpose of each NatSpec tag and where it may be used. As a special case, if no tags are used then the Solidity compiler will interpret a /// or /** comment in the same way as if it were tagged with @notice.

Tag
		

Context

@title
	

A title that should describe the contract/interface
	

contract, library, interface, struct, enum

@author
	

The name of the author
	

contract, library, interface, struct, enum

@notice
	

Explain to an end user what this does
	

contract, library, interface, function, public state variable, event, struct, enum, error

@dev
	

Explain to a developer any extra details
	

contract, library, interface, function, state variable, event, struct, enum, error

@param
	

Documents a parameter just like in Doxygen (must be followed by parameter name)
	

function, event, error

@return
	

Documents the return variables of a contract’s function
	

function, public state variable

@inheritdoc
	

Copies all missing tags from the base function (must be followed by the contract name)
	

function, public state variable

@custom:...
	

Custom tag, semantics is application-defined
	

everywhere

If your function returns multiple values, like (int quotient, int remainder) then use multiple @return statements in the same format as the @param statements.

Custom tags start with @custom: and must be followed by one or more lowercase letters or hyphens. It cannot start with a hyphen however. They can be used everywhere and are part of the developer documentation.
Dynamic expressions

The Solidity compiler will pass through NatSpec documentation from your Solidity source code to the JSON output as described in this guide. The consumer of this JSON output, for example the end-user client software, may present this to the end-user directly or it may apply some pre-processing.

For example, some client software will render:

open in Remix

/// @notice This function will multiply `a` by 7

to the end-user as:

This function will multiply 10 by 7

if a function is being called and the input a is assigned a value of 10.
Inheritance Notes

Functions without NatSpec will automatically inherit the documentation of their base function. Exceptions to this are:

    When the parameter names are different.

    When there is more than one base function.

    When there is an explicit @inheritdoc tag which specifies which contract should be used to inherit.

Documentation Output

When parsed by the compiler, documentation such as the one from the above example will produce two different JSON files. One is meant to be consumed by the end user as a notice when a function is executed and the other to be used by the developer.

If the above contract is saved as ex1.sol then you can generate the documentation using:

solc --userdoc --devdoc ex1.sol

And the output is below.

Note

Starting Solidity version 0.6.11 the NatSpec output also contains a version and a kind field. Currently the version is set to 1 and kind must be one of user or dev. In the future it is possible that new versions will be introduced, deprecating older ones.
User Documentation

The above documentation will produce the following user documentation JSON file as output for the Tree contract:

{
  "version" : 1,
  "kind" : "user",
  "methods" :
  {
    "age(uint256)" :
    {
      "notice" : "Calculate tree age in years, rounded up, for live trees"
    },
    "leaves()" :
    {
        "notice" : "Returns the amount of leaves the tree has."
    }
  },
  "notice" : "You can use this contract for only the most basic simulation"
}

Note that the key by which to find the methods is the function’s canonical signature as defined in the Contract ABI and not simply the function’s name.
Developer Documentation

Apart from the user documentation file, a developer documentation JSON file should also be produced and should look like this:

{
  "version" : 1,
  "kind" : "dev",
  "author" : "Larry A. Gardner",
  "details" : "All function calls are currently implemented without side effects",
  "custom:experimental" : "This is an experimental contract.",
  "methods" :
  {
    "age(uint256)" :
    {
      "details" : "The Alexandr N. Tetearing algorithm could increase precision",
      "params" :
      {
        "rings" : "The number of rings from dendrochronological sample"
      },
      "returns" : {
        "_0" : "Age in years, rounded up for partial years",
        "_1" : "Name of the tree"
      }
    },
    "leaves()" :
    {
        "details" : "Returns only a fixed number."
    }
  },
  "title" : "A simulator for trees"
}



Style Guide
Introduction

This guide is intended to provide coding conventions for writing Solidity code. This guide should be thought of as an evolving document that will change over time as useful conventions are found and old conventions are rendered obsolete.

Many projects will implement their own style guides. In the event of conflicts, project specific style guides take precedence.

The structure and many of the recommendations within this style guide were taken from Python’s pep8 style guide.

The goal of this guide is not to be the right way or the best way to write Solidity code. The goal of this guide is consistency. A quote from Python’s pep8 captures this concept well.

Note

A style guide is about consistency. Consistency with this style guide is important. Consistency within a project is more important. Consistency within one module or function is most important.

But most importantly: know when to be inconsistent – sometimes the style guide just doesn’t apply. When in doubt, use your best judgment. Look at other examples and decide what looks best. And do not hesitate to ask!
Code Layout
Indentation

Use 4 spaces per indentation level.
Tabs or Spaces

Spaces are the preferred indentation method.

Mixing tabs and spaces should be avoided.
Blank Lines

Surround top level declarations in Solidity source with two blank lines.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract A {
    // ...
}


contract B {
    // ...
}


contract C {
    // ...
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract A {
    // ...
}
contract B {
    // ...
}

contract C {
    // ...
}

Within a contract surround function declarations with a single blank line.

Blank lines may be omitted between groups of related one-liners (such as stub functions for an abstract contract)

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

abstract contract A {
    function spam() public virtual pure;
    function ham() public virtual pure;
}


contract B is A {
    function spam() public pure override {
        // ...
    }

    function ham() public pure override {
        // ...
    }
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

abstract contract A {
    function spam() virtual pure public;
    function ham() public virtual pure;
}


contract B is A {
    function spam() public pure override {
        // ...
    }
    function ham() public pure override {
        // ...
    }
}

Maximum Line Length

Maximum suggested line length is 120 characters.

Wrapped lines should conform to the following guidelines.

    The first argument should not be attached to the opening parenthesis.

    One, and only one, indent should be used.

    Each argument should fall on its own line.

    The terminating element, );, should be placed on the final line by itself.

Function Calls

Yes:

open in Remix

thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3
);

No:

open in Remix

thisFunctionCallIsReallyLong(longArgument1,
                              longArgument2,
                              longArgument3
);

thisFunctionCallIsReallyLong(longArgument1,
    longArgument2,
    longArgument3
);

thisFunctionCallIsReallyLong(
    longArgument1, longArgument2,
    longArgument3
);

thisFunctionCallIsReallyLong(
longArgument1,
longArgument2,
longArgument3
);

thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3);

Assignment Statements

Yes:

open in Remix

thisIsALongNestedMapping[being][set][toSomeValue] = someFunction(
    argument1,
    argument2,
    argument3,
    argument4
);

No:

open in Remix

thisIsALongNestedMapping[being][set][toSomeValue] = someFunction(argument1,
                                                                   argument2,
                                                                   argument3,
                                                                   argument4);

Event Definitions and Event Emitters

Yes:

open in Remix

event LongAndLotsOfArgs(
    address sender,
    address recipient,
    uint256 publicKey,
    uint256 amount,
    bytes32[] options
);

emit LongAndLotsOfArgs(
    sender,
    recipient,
    publicKey,
    amount,
    options
);

No:

open in Remix

event LongAndLotsOfArgs(address sender,
                        address recipient,
                        uint256 publicKey,
                        uint256 amount,
                        bytes32[] options);

emit LongAndLotsOfArgs(sender,
                  recipient,
                  publicKey,
                  amount,
                  options);

Source File Encoding

UTF-8 or ASCII encoding is preferred.
Imports

Import statements should always be placed at the top of the file.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

import "./Owned.sol";

contract A {
    // ...
}


contract B is Owned {
    // ...
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract A {
    // ...
}


import "./Owned.sol";


contract B is Owned {
    // ...
}

Order of Functions

Ordering helps readers identify which functions they can call and to find the constructor and fallback definitions easier.

Functions should be grouped according to their visibility and ordered:

    constructor

    receive function (if exists)

    fallback function (if exists)

    external

    public

    internal

    private

Within a grouping, place the view and pure functions last.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract A {
    constructor() {
        // ...
    }

    receive() external payable {
        // ...
    }

    fallback() external {
        // ...
    }

    // External functions
    // ...

    // External functions that are view
    // ...

    // External functions that are pure
    // ...

    // Public functions
    // ...

    // Internal functions
    // ...

    // Private functions
    // ...
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract A {

    // External functions
    // ...

    fallback() external {
        // ...
    }
    receive() external payable {
        // ...
    }

    // Private functions
    // ...

    // Public functions
    // ...

    constructor() {
        // ...
    }

    // Internal functions
    // ...
}

Whitespace in Expressions

Avoid extraneous whitespace in the following situations:

Immediately inside parenthesis, brackets or braces, with the exception of single line function declarations.

Yes:

open in Remix

spam(ham[1], Coin({name: "ham"}));

No:

open in Remix

spam( ham[ 1 ], Coin( { name: "ham" } ) );

Exception:

open in Remix

function singleLine() public { spam(); }

Immediately before a comma, semicolon:

Yes:

open in Remix

function spam(uint i, Coin coin) public;

No:

open in Remix

function spam(uint i , Coin coin) public ;

More than one space around an assignment or other operator to align with another:

Yes:

open in Remix

x = 1;
y = 2;
longVariable = 3;

No:

open in Remix

x            = 1;
y            = 2;
longVariable = 3;

Do not include a whitespace in the receive and fallback functions:

Yes:

open in Remix

receive() external payable {
    ...
}

fallback() external {
    ...
}

No:

open in Remix

receive () external payable {
    ...
}

fallback () external {
    ...
}

Control Structures

The braces denoting the body of a contract, library, functions and structs should:

    open on the same line as the declaration

    close on their own line at the same indentation level as the beginning of the declaration.

    The opening brace should be preceded by a single space.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Coin {
    struct Bank {
        address owner;
        uint balance;
    }
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Coin
{
    struct Bank {
        address owner;
        uint balance;
    }
}

The same recommendations apply to the control structures if, else, while, and for.

Additionally there should be a single space between the control structures if, while, and for and the parenthetic block representing the conditional, as well as a single space between the conditional parenthetic block and the opening brace.

Yes:

open in Remix

if (...) {
    ...
}

for (...) {
    ...
}

No:

open in Remix

if (...)
{
    ...
}

while(...){
}

for (...) {
    ...;}

For control structures whose body contains a single statement, omitting the braces is ok if the statement is contained on a single line.

Yes:

open in Remix

if (x < 10)
    x += 1;

No:

open in Remix

if (x < 10)
    someArray.push(Coin({
        name: 'spam',
        value: 42
    }));

For if blocks which have an else or else if clause, the else should be placed on the same line as the if’s closing brace. This is an exception compared to the rules of other block-like structures.

Yes:

open in Remix

if (x < 3) {
    x += 1;
} else if (x > 7) {
    x -= 1;
} else {
    x = 5;
}


if (x < 3)
    x += 1;
else
    x -= 1;

No:

open in Remix

if (x < 3) {
    x += 1;
}
else {
    x -= 1;
}

Function Declaration

For short function declarations, it is recommended for the opening brace of the function body to be kept on the same line as the function declaration.

The closing brace should be at the same indentation level as the function declaration.

The opening brace should be preceded by a single space.

Yes:

open in Remix

function increment(uint x) public pure returns (uint) {
    return x + 1;
}

function increment(uint x) public pure onlyOwner returns (uint) {
    return x + 1;
}

No:

open in Remix

function increment(uint x) public pure returns (uint)
{
    return x + 1;
}

function increment(uint x) public pure returns (uint){
    return x + 1;
}

function increment(uint x) public pure returns (uint) {
    return x + 1;
    }

function increment(uint x) public pure returns (uint) {
    return x + 1;}

The modifier order for a function should be:

    Visibility

    Mutability

    Virtual

    Override

    Custom modifiers

Yes:

open in Remix

function balance(uint from) public view override returns (uint)  {
    return balanceOf[from];
}

function increment(uint x) public pure onlyOwner returns (uint) {
    return x + 1;
}

No:

open in Remix

function balance(uint from) public override view returns (uint)  {
    return balanceOf[from];
}

function increment(uint x) onlyOwner public pure returns (uint) {
    return x + 1;
}

For long function declarations, it is recommended to drop each argument onto its own line at the same indentation level as the function body. The closing parenthesis and opening bracket should be placed on their own line as well at the same indentation level as the function declaration.

Yes:

open in Remix

function thisFunctionHasLotsOfArguments(
    address a,
    address b,
    address c,
    address d,
    address e,
    address f
)
    public
{
    doSomething();
}

No:

open in Remix

function thisFunctionHasLotsOfArguments(address a, address b, address c,
    address d, address e, address f) public {
    doSomething();
}

function thisFunctionHasLotsOfArguments(address a,
                                        address b,
                                        address c,
                                        address d,
                                        address e,
                                        address f) public {
    doSomething();
}

function thisFunctionHasLotsOfArguments(
    address a,
    address b,
    address c,
    address d,
    address e,
    address f) public {
    doSomething();
}

If a long function declaration has modifiers, then each modifier should be dropped to its own line.

Yes:

open in Remix

function thisFunctionNameIsReallyLong(address x, address y, address z)
    public
    onlyOwner
    priced
    returns (address)
{
    doSomething();
}

function thisFunctionNameIsReallyLong(
    address x,
    address y,
    address z
)
    public
    onlyOwner
    priced
    returns (address)
{
    doSomething();
}

No:

open in Remix

function thisFunctionNameIsReallyLong(address x, address y, address z)
                                      public
                                      onlyOwner
                                      priced
                                      returns (address) {
    doSomething();
}

function thisFunctionNameIsReallyLong(address x, address y, address z)
    public onlyOwner priced returns (address)
{
    doSomething();
}

function thisFunctionNameIsReallyLong(address x, address y, address z)
    public
    onlyOwner
    priced
    returns (address) {
    doSomething();
}

Multiline output parameters and return statements should follow the same style recommended for wrapping long lines found in the Maximum Line Length section.

Yes:

open in Remix

function thisFunctionNameIsReallyLong(
    address a,
    address b,
    address c
)
    public
    returns (
        address someAddressName,
        uint256 LongArgument,
        uint256 Argument
    )
{
    doSomething()

    return (
        veryLongReturnArg1,
        veryLongReturnArg2,
        veryLongReturnArg3
    );
}

No:

open in Remix

function thisFunctionNameIsReallyLong(
    address a,
    address b,
    address c
)
    public
    returns (address someAddressName,
             uint256 LongArgument,
             uint256 Argument)
{
    doSomething()

    return (veryLongReturnArg1,
            veryLongReturnArg1,
            veryLongReturnArg1);
}

For constructor functions on inherited contracts whose bases require arguments, it is recommended to drop the base constructors onto new lines in the same manner as modifiers if the function declaration is long or hard to read.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
// Base contracts just to make this compile
contract B {
    constructor(uint) {
    }
}


contract C {
    constructor(uint, uint) {
    }
}


contract D {
    constructor(uint) {
    }
}


contract A is B, C, D {
    uint x;

    constructor(uint param1, uint param2, uint param3, uint param4, uint param5)
        B(param1)
        C(param2, param3)
        D(param4)
    {
        // do something with param5
        x = param5;
    }
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Base contracts just to make this compile
contract B {
    constructor(uint) {
    }
}


contract C {
    constructor(uint, uint) {
    }
}


contract D {
    constructor(uint) {
    }
}


contract A is B, C, D {
    uint x;

    constructor(uint param1, uint param2, uint param3, uint param4, uint param5)
    B(param1)
    C(param2, param3)
    D(param4) {
        x = param5;
    }
}


contract X is B, C, D {
    uint x;

    constructor(uint param1, uint param2, uint param3, uint param4, uint param5)
        B(param1)
        C(param2, param3)
        D(param4) {
            x = param5;
        }
}

When declaring short functions with a single statement, it is permissible to do it on a single line.

Permissible:

open in Remix

function shortFunction() public { doSomething(); }

These guidelines for function declarations are intended to improve readability. Authors should use their best judgment as this guide does not try to cover all possible permutations for function declarations.
Mappings

In variable declarations, do not separate the keyword mapping from its type by a space. Do not separate any nested mapping keyword from its type by whitespace.

Yes:

open in Remix

mapping(uint => uint) map;
mapping(address => bool) registeredAddresses;
mapping(uint => mapping(bool => Data[])) public data;
mapping(uint => mapping(uint => s)) data;

No:

open in Remix

mapping (uint => uint) map;
mapping( address => bool ) registeredAddresses;
mapping (uint => mapping (bool => Data[])) public data;
mapping(uint => mapping (uint => s)) data;

Variable Declarations

Declarations of array variables should not have a space between the type and the brackets.

Yes:

open in Remix

uint[] x;

No:

open in Remix

uint [] x;

Other Recommendations

    Strings should be quoted with double-quotes instead of single-quotes.

Yes:

open in Remix

str = "foo";
str = "Hamlet says, 'To be or not to be...'";

No:

open in Remix

str = 'bar';
str = '"Be yourself; everyone else is already taken." -Oscar Wilde';

    Surround operators with a single space on either side.

Yes:

open in Remix

x = 3;
x = 100 / 10;
x += 3 + 4;
x |= y && z;

No:

open in Remix

x=3;
x = 100/10;
x += 3+4;
x |= y&&z;

    Operators with a higher priority than others can exclude surrounding whitespace in order to denote precedence. This is meant to allow for improved readability for complex statements. You should always use the same amount of whitespace on either side of an operator:

Yes:

open in Remix

x = 2**3 + 5;
x = 2*y + 3*z;
x = (a+b) * (a-b);

No:

open in Remix

x = 2** 3 + 5;
x = y+z;
x +=1;

Order of Layout

Contract elements should be laid out in the following order:

    Pragma statements

    Import statements

    Events

    Errors

    Interfaces

    Libraries

    Contracts

Inside each contract, library or interface, use the following order:

    Type declarations

    State variables

    Events

    Errors

    Modifiers

    Functions

Note

It might be clearer to declare types close to their use in events or state variables.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

abstract contract Math {
    error DivideByZero();
    function divide(int256 numerator, int256 denominator) public virtual returns (uint256);
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

abstract contract Math {
    function divide(int256 numerator, int256 denominator) public virtual returns (uint256);
    error DivideByZero();
}

Naming Conventions

Naming conventions are powerful when adopted and used broadly. The use of different conventions can convey significant meta information that would otherwise not be immediately available.

The naming recommendations given here are intended to improve the readability, and thus they are not rules, but rather guidelines to try and help convey the most information through the names of things.

Lastly, consistency within a codebase should always supersede any conventions outlined in this document.
Naming Styles

To avoid confusion, the following names will be used to refer to different naming styles.

    b (single lowercase letter)

    B (single uppercase letter)

    lowercase

    UPPERCASE

    UPPER_CASE_WITH_UNDERSCORES

    CapitalizedWords (or CapWords)

    mixedCase (differs from CapitalizedWords by initial lowercase character!)

Note

When using initialisms in CapWords, capitalize all the letters of the initialisms. Thus HTTPServerError is better than HttpServerError. When using initialisms in mixedCase, capitalize all the letters of the initialisms, except keep the first one lower case if it is the beginning of the name. Thus xmlHTTPRequest is better than XMLHTTPRequest.
Names to Avoid

    l - Lowercase letter el

    O - Uppercase letter oh

    I - Uppercase letter eye

Never use any of these for single letter variable names. They are often indistinguishable from the numerals one and zero.
Contract and Library Names

    Contracts and libraries should be named using the CapWords style. Examples: SimpleToken, SmartBank, CertificateHashRepository, Player, Congress, Owned.

    Contract and library names should also match their filenames.

    If a contract file includes multiple contracts and/or libraries, then the filename should match the core contract. This is not recommended however if it can be avoided.

As shown in the example below, if the contract name is Congress and the library name is Owned, then their associated filenames should be Congress.sol and Owned.sol.

Yes:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Owned.sol
contract Owned {
    address public owner;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}

and in Congress.sol:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

import "./Owned.sol";


contract Congress is Owned, TokenRecipient {
    //...
}

No:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// owned.sol
contract owned {
    address public owner;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}

and in Congress.sol:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.0;


import "./owned.sol";


contract Congress is owned, tokenRecipient {
    //...
}

Struct Names

Structs should be named using the CapWords style. Examples: MyCoin, Position, PositionXY.
Event Names

Events should be named using the CapWords style. Examples: Deposit, Transfer, Approval, BeforeTransfer, AfterTransfer.
Function Names

Functions should use mixedCase. Examples: getBalance, transfer, verifyOwner, addMember, changeOwner.
Function Argument Names

Function arguments should use mixedCase. Examples: initialSupply, account, recipientAddress, senderAddress, newOwner.

When writing library functions that operate on a custom struct, the struct should be the first argument and should always be named self.
Local and State Variable Names

Use mixedCase. Examples: totalSupply, remainingSupply, balancesOf, creatorAddress, isPreSale, tokenExchangeRate.
Constants

Constants should be named with all capital letters with underscores separating words. Examples: MAX_BLOCKS, TOKEN_NAME, TOKEN_TICKER, CONTRACT_VERSION.
Modifier Names

Use mixedCase. Examples: onlyBy, onlyAfter, onlyDuringThePreSale.
Enums

Enums, in the style of simple type declarations, should be named using the CapWords style. Examples: TokenGroup, Frame, HashStyle, CharacterLocation.
Avoiding Naming Collisions

    singleTrailingUnderscore_

This convention is suggested when the desired name collides with that of an existing state variable, function, built-in or otherwise reserved name.
Underscore Prefix for Non-external Functions and Variables

    _singleLeadingUnderscore

This convention is suggested for non-external functions and state variables (private or internal). State variables without a specified visibility are internal by default.

When designing a smart contract, the public-facing API (functions that can be called by any account) is an important consideration. Leading underscores allow you to immediately recognize the intent of such functions, but more importantly, if you change a function from non-external to external (including public) and rename it accordingly, this forces you to review every call site while renaming. This can be an important manual check against unintended external functions and a common source of security vulnerabilities (avoid find-replace-all tooling for this change).
NatSpec

Solidity contracts can also contain NatSpec comments. They are written with a triple slash (///) or a double asterisk block (/** ... */) and they should be used directly above function declarations or statements.

For example, the contract from a simple smart contract with the comments added looks like the one below:

open in Remix

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

/// @author The Solidity Team
/// @title A simple storage example
contract SimpleStorage {
    uint storedData;

    /// Store `x`.
    /// @param x the new value to store
    /// @dev stores the number in the state variable `storedData`
    function set(uint x) public {
        storedData = x;
    }

    /// Return the stored value.
    /// @dev retrieves the value of the state variable `storedData`
    /// @return the stored value
    function get() public view returns (uint) {
        return storedData;
    }
}

It is recommended that Solidity contracts are fully annotated using NatSpec for all public interfaces (everything in the ABI).

Please see the section about NatSpec for a detailed explanation.

© Copyright 2016-2025, The Solidity Authors.

Customized with ❤️ by the ethereum.org team.

Credits and attribution. 