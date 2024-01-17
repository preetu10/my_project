import prisma from "../DB/db.config.js";

export const createSellPost = async(req,res)=>{
    const b_title =req.body.b_title;
    const  b_authorname =req.body.b_authorname;
    const b_edition =req.body.b_edition;
    const b_numOfPages=Number(req.body.b_numOfPages);
    const b_description=req.body.b_description;
    const b_price =Number(req.body.b_price);
    const b_quantity =Number(req.body.b_quantity);
    const category = req.body.category;
    const soldBy_Email =req.body.b_soldBy_Email;
    const newPost=await prisma.sellingBook.create({
        data:{
            b_title:b_title,
            b_authorname:b_authorname,
            b_edition:b_edition,
            b_numOfPages:b_numOfPages,
            b_description:b_description,
            b_price:b_price,
            b_quantity:b_quantity,
            category:category,
            soldBy_Email:soldBy_Email
        },
    });
    res.send(newPost);
}

export const getBuyPosts = async(req,res)=>{
    const posts= await prisma.sellingBook.findMany({
        where:{
            b_quantity:{
                not: 0
            }
        }
    })
    
    console.log(posts);
    res.send(posts);
}

export const getABook =  async(req,res)=>{
    const sid = req.params.sid; 
    const gotBook = await prisma.sellingBook.findFirst({
        where: {
            sid: Number(sid),
    },
    });
    res.send(gotBook);
}

export const orderPlace = async(req,res)=>{
    const quantity =req.body.b_quantity;
    const pickupPoint =req.body.pickupPoint;
    const phone =req.body.phone;
    const takenBy_Email = req.body.takenBy_Email;
    const sbId =req.body.sbID;
    const perPrice = req.body.price;
    const total = Number(quantity) * Number(perPrice);

    const findBook= await prisma.sellingBook.findFirst({
        where:{
            sid:Number(sbId)
        }
    })
    if(findBook.b_quantity < Number(quantity)){
      
        res.status(205).send("Not enough stock of this book. You can order minimum "+findBook.b_quantity+" books.");
    }
    else{
    const newOrder = await prisma.order.create({
        data:{
            quantity: Number(quantity),
            pickupPoint: pickupPoint,
            phone: phone,
            total: Number(total),
            takenBy_Email: takenBy_Email,
            sbId: Number(sbId),
        }
    })
    if(newOrder!=null){
        const updateMain=await prisma.sellingBook.update({
            where:{
                sid:Number(sbId)
            },
            data:{
                b_quantity:{
                    decrement: Number(quantity),
                }
            }

        })
        res.status(200).send(newOrder);
    }
        else
        res.status(204).send("Order not placed.")
    }
}

export const getOrderRequests = async(req,res)=>{
    const myMail= req.params.eEmail;
     const results = await prisma.order.findMany({
      select: {
        orderId: true,
        orderedAt: true,
        phone: true,
        takenBy: {
          select: {
            email: true,
          },
        },
        sellbook: {
          select: {
            b_title: true,
            b_authorname: true,
            b_edition: true,
          },
        },
      },
      where: {
        AND: [
           { 
              sellbook: {
                soldBy_Email: myMail,
               },
          },
            { state:"Pending" },
          ],
      },
    });
    // results.forEach(item=>{
    //     console.log(item.epId);
    //     console.log(item.postAt);
    //     console.log(item.exchanger.email);
    //     console.log(item.exchangeId.b_title);
    //     console.log(item.exchangeId.b_authorname);
    //     console.log(item.exchangeId.b_edition);
    // })
  
    const requests= [];
    results.forEach(item=>{
      const requestObject = {
        orderId: item.orderId,
        takenBy_Email:item.takenBy.email,
        orderedAt:item.orderedAt,
        phone:item.phone,
        b_title:item.sellbook.b_title,
        b_authorname:item.sellbook.b_authorname,
        b_edition:item.sellbook.b_edition
      };
      requests.push(requestObject);
    })
    if(requests)
        res.status(200).send(requests);
    else
        res.status(204).send("Process could not be completed.");
}
  
  
export const deleteOrderProcess = async(req,res)=>{
    const orderId = req.params.orderId;
    const gotBook = await prisma.order.findFirst({
      where: {
          orderId: Number(orderId),
      },
    });
    const book= gotBook.sbId;
    const resetAgain= await prisma.sellingBook.update({
      where:{
        sid: Number(book),
      },
      data:{
        b_quantity:{
            increment: Number(gotBook.quantity),
        }
       }
    });
    const deleteProcess= await prisma.order.delete({
      where:{
        orderId: Number(orderId)
      }
    });
    if(deleteProcess!=null){
      res.status(200).send("Process deleted");
    }
    else
    res.status(204).send("Could NOT Delete.");
}
  
export const confirmOrderRequest = async(req,res)=>{
    const orderId=req.params.orderId;
    const confirm= await prisma.order.update({
      where:{
        orderId:Number(orderId),
      },
      data:{
        state:"Confirmed",
      }
    });
    if(confirm!=null){
       res.status(200).send("Process Completed Successfully");
    }
    else{
      res.status(204).send("Process could not be completed.");
    }
}

export const getMySellPosts = async (req, res) => {
    const soldBy_Email = req.params.eEmail;
    const gotBook = await prisma.sellingBook.findMany({
      where: {
          soldBy_Email: soldBy_Email,
    },
    select:{
      sid :true,
      b_title :true,
      b_authorname:true,
      b_edition :true,
      b_numOfPages :true,
      b_price:true,
      b_quantity:true,
      category:true,
    }
  });
  const result=[];
  gotBook.forEach(item=>{
    const requestObject = {
      sid: item.sid,
      b_title:item.b_title,
      b_authorname:item.b_authorname,
      b_edition:item.b_edition,
      b_numOfPages:item.b_numOfPages,
      b_price:item.b_price,
      b_quantity:item.b_quantity,
      category:item.category,
    };
    
    result.push(requestObject);
  })
  console.log(result);
  res.send(result);
}

export const getMyPurchase= async (req, res) => {
  const eEmail = req.params.eEmail;
  const gotBook= await prisma.order.findMany({
    where:{
      takenBy_Email:eEmail,
    },
    select:{
      orderId:true,
      orderedAt:true,
      state:true,
      quantity:true,
      pickupPoint:true,
      total:true,
      sellbook:{
        select:{
          b_title:true,
          b_authorname:true,
          b_edition:true,
          soldBy_Email:true,
        }
      }
    }
  })

  const orders= [];
  gotBook.forEach(item=>{
    const orderObject = {
      orderId: item.orderId,
      soldBy_Email:item.sellbook.soldBy_Email,
      orderedAt:item.orderedAt,
      quantity:item.quantity,
      b_title:item.sellbook.b_title,
      b_authorname:item.sellbook.b_authorname,
      b_edition:item.sellbook.b_edition,
      pickupPoint:item.pickupPoint,
      total:item.total,
      state:item.state,
    };
    orders.push(orderObject);
  })
  console.log(orders);
  if(orders)
      res.status(200).send(orders);
  else
      res.status(204).send("Process could not be completed.");
  
};

export const getMySellRecords = async (req, res) =>{
    const eEmail= req.params.eEmail;
    const getRecords= await prisma.order.findMany({
      select:{
        orderId:true,
        orderedAt:true,
        takenBy_Email:true,
        pickupPoint:true,
        phone:true,
        quantity:true,
        total:true,
        sbId:true,
        takenBy:{
          select:{
            name:true,
          }
        },
        sellbook:{
          select:{
            b_title:true,
          }   
          }
      },
      where:{
        AND: [
          { 
             sellbook: {
               soldBy_Email: eEmail,
              },
         },
           { state:"Confirmed" },
         ],
      }
    });
    const records=[];
    getRecords.forEach(record=>{
      const recordObject = {
        orderId: record.orderId,
        sbId: record.sbId,
        orderedAt: record.orderedAt,
        takenBy_Email: record.takenBy_Email,
        phone: record.phone,
        pickupPoint: record.pickupPoint,
        quantity: record.quantity,
        total: record.total,
        b_title:record.sellbook.b_title,
        name:record.takenBy.name,
      }
      records.push(recordObject);
    })
    res.send(records);
}
