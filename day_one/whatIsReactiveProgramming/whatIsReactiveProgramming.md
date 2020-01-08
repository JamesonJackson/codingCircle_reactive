<details>
  <summary>What is Reactive Programming?</summary>
  
  Reactive programming focues on propagating changes without having to explicitly specify how the propagation happens. This allows us to state what our code should do, without having to code every step to do it (declarative v. imperative). This results in a more reliable and maintainable approaching to building software. 

  The quintessential example of a reactive system? **Spreadsheets!**
  
  We have all used them, but rarely stop to think how shockingly intuitive they are. 
  
  Let’s say we have a value in cell `A1` of the spreadsheet. We can then reference it in other cells and whenever we change A1, every cell depending on A1 will automatically update its own value.
  
  This behavior feels natural to us. 
  
  We didn’t have to tell the computer to update the cells that depend on `A1` or how to do it (step by step). 
  
  These cells just react to the change. 
  
  In a spreadsheet we simply declare our problem, and we don’t worry about how the computer calculates the results. 
  
  This is what reactive programming is aiming for. To simply declare relationships between entities and for the program to evolve as these entities change.

  To think reactively is to think in terms of transforming sets, transforming one or a few sets of events into the set of events that you actually want.
</details>