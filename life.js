"use strict";
var Life = {};

Life.nRow = 100;        //ширина та висота поля (кількість клітинок)
Life.nCol = 100;

Life.emptyCell = 255;   //колір мертвої клытинки (білий)
Life.LifeCell = 0;      //колір мертвої клытинки (чорний)

Life.Speed=1000;

Life.list1 = {};
Life.list2 = {};


 // отримання статусу клітинки за її координатами або установлення відповідного статусу
Life.CellStatus = function(row, col, status)

{

    var st = renderingGeometry.faces[Life.getId(row, col)].color.r;
    if (arguments.length > 2) renderingGeometry.faces[Life.getId(row, col)].color.setRGB(status,status,status);
    return st;

};
// отримання ID клітинки за її координатами
Life.getId = function(row, col)

{
    return renderingGeometry.names[row+'_'+col];
};



 // очищення поля
Life.clear = function()

{


// кожній клітинці присвоюєм статус "пуста"

// і видаляєм її зі списку  Life.list1

    for(var cell in Life.list1)

    {
        var ob = Life.getRowCol(cell);
        Life.CellStatus(ob.row,ob.col,Life.emptyCell);
        delete Life.list1[cell];
    }



};








Life.changeCellStatus = function(row, col, num)

{
    if (arguments.length<3){

    var id = Life.getId(row, col)} else {var id = num;}
    var  st = renderingGeometry.faces[id].color.r;

    if ((st == Life.LifeCell)||(!st))

    {
        renderingGeometry.faces[id].color.setRGB(Life.emptyCell,Life.emptyCell,Life.emptyCell); // змінюєм фон на "мертвий"
        renderingGeometry.colorsNeedUpdate = true;
        delete Life.list1[id]; // видаляєм клітинку з Life.list1
    }

    else

    {

        renderingGeometry.faces[id].color.r = Life.lifeCell;
        renderingGeometry.faces[id].color.g = Life.lifeCell;
        renderingGeometry.faces[id].color.b = Life.lifeCell;

        renderingGeometry.colorsNeedUpdate = true;
        Life.list1[id] = 100; // додаєм клітинку в Life.list1

    }

};


// отримання координат клытинки за її індексом
Life.getRowCol = function(id)

{
    var ob = {};

    id = renderingGeometry.faces[id].nameID
    var d = id.split("_");
    ob.row = parseInt(d[0]);
    ob.col = parseInt(d[1]);

    return ob;

};

// генерація покоління
Life.generation = function(load) {

    if ((isCtrlDown>0)||(arguments.length>0))
    {
        if (arguments.length>0){
            Life.clear();
            Life.list1 = load };

// копіюєм список1 в список2

        for(var cell in Life.list1) Life.list2[cell] = Life.list1[cell];

// заносим сусідів живих клітинок в другий список.

// тепер кожен елемент list2 містить кількість живих сусідів плюс стан самої клітини

// якщо клітина жива додаєм 100

        for(var cell in Life.list1)

        {
            var list = Life.listNear(cell); // список сусідів клітинки  cell
// додаєм в list2 кллытинки яких там нема
// якщо вона вже є, то збільшуєм кількість сусідів на 1

            for(var k in list) Life.list2[k] = Life.list2[k] ? (Life.list2[k]+1) : 1;

// видаляєм клітинку з першого списку
            delete Life.list1[cell];
        }

// перший список зараз пустий

        for(var cell in Life.list2)
        {


// 3, 102, 103 замінюєм на 100 (живі клітинки в наступному поколінні)
// замінюєм на 0 якщо клітина "померла"

            Life.list2[cell] = (Life.list2[cell] == 3 || Life.list2[cell] == 102 || Life.list2[cell] == 103) ? 100 : 0;

// якщо 100 то додаєм в перший список і зафарбовуєм відповідну клітинку
// інакше зафарбовуєм в колір фону.

            var ob = Life.getRowCol(cell); // отримуєм координати клітинки

            if (Life.list2[cell] == 100)
            {
                Life.list1[cell] = 100;
                Life.CellStatus(ob.row, ob.col, Life.LifeCell );
            }

            else Life.CellStatus(ob.row,ob.col,Life.emptyCell);

// видаляєм клітинку з другого списку.
            delete Life.list2[cell];

        }

// покоління згенеровано
// тепер list2 пустий а в List1 зыбрані всі живі клітинки



    };
    Life.time++;
};

// ---------------------------------------------------

// побудова списку сусідів (8 клітинок):

// 2 1 3

// 4 * 5

// 7 6 8

// --------------------------------------------------

Life.listNear = function(cell)

{

    var list = {}; // тут буде список сусідів cell
    var row, col; // тут будуть координати сусідів

// отрирмуєм координати для поточної клітинки
    var ob = Life.getRowCol(cell);

// сусіди в рядку вище
    row = ob.row-1;
    if(row < 0) row = Life.nRow-1; // враховуєм що середовище - тор
    col = ob.col;
    list[Life.getId(row, col)] = 1; // клітинка 1

    col = ob.col-1;
    if(col < 0) col = Life.nCol-1; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 2

    col = ob.col+1;
    if(col >= Life.nCol) col = 0; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 3

    row = ob.row;
    col = ob.col-1;
    if(col < 0) col = Life.nCol-1; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 4

    col = ob.col+1;
    if(col >= Life.nCol) col = 0; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 5 

    row = ob.row+1;
    if(row >= Life.nRow) row = 0 // враховуєм що середовище - тор
    col = ob.col;

    list[Life.getId(row, col)] = 1; // клітинка 6
    col = ob.col-1;

    if(col < 0) col = Life.nCol-1; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 7 

    col = ob.col+1;
    if(col >= Life.nCol) col = 0; // враховуєм що середовище - тор
    list[Life.getId(row, col)] = 1; // клітинка 8

    return list; // вертаєм список сусідів

}
